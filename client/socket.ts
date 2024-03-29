import { LobbyWorld, Tower, User } from "../server/types.ts";
import { io } from "https://esm.sh/socket.io-client@4.7.5?target=es2020";
import rounds from "./rounds.json" with { type: "json" };
import { hideStartGameButton, setMoney, setRound } from "./ui.ts";

interface LobbyState {
  state: "waiting" | "playing";
  round: number;
  maxNumberOfRounds: number;
}

export const socket = io("http://192.168.1.203:3000", {
  withCredentials: true,
});


export let isAdmin = false;
export let areAnimalsLeft = true;

export const lobbyState: LobbyState = {
  state: "waiting",
  round: 1,
  maxNumberOfRounds: -1,
};

export let currentWorldData: LobbyWorld | null = null;

/* Should be called at the end of each round by the admin */
export function sendGameData(worldData: LobbyWorld) {
  socket.emit("newWorldData", {
    lobbyId: "lobby",
    worldData,
  });
}

export function killAnimal(animalId: string, owner: string) {
  const user = currentWorldData?.users.find((user) => user.name === socket.id);
  if (user && owner === socket.id) {
    user.money += currentWorldData?.animals.find((animal) => animal.id === animalId)?.price || 0;
    updateMoney(user.money);
    setMoney(user.money);
  }
  socket.emit("killAnimal", { lobbyId: "lobby", animalId });
}

export function isMe(user: User) {
  return user.name === socket.id;
}

export function placeBuilding(building: Tower) {
  const user = currentWorldData?.users.find((user) => user.name === socket.id);
  console.log(user, currentWorldData?.users);
  building.owner = user?.name || "";
  if (user?.money && user.money >= building.cost) {
    user.money -= building.cost;
    updateMoney(user.money);
  } else {
    console.log("Not enough money");
    return;
  }
  socket.emit("placeBuilding", { lobbyId: "lobby", building });
}

export function startGame(numOfRounds: number) {
  const user = currentWorldData?.users.find((user) => user.name === socket.id);
  if (!user?.admin) {
    return;
  }
  socket.emit("startGame", { lobbyId: "lobby", numOfRounds });
}

export function updateMoney(money: number) {
  setMoney(money);
  socket.emit("updateMoney", { lobbyId: "lobby", money });
}

function startRound(round: number) {
  if (round > rounds.length) {
    return;
  }
  console.log(round)
  areAnimalsLeft = true;
  const roundData = rounds[round - 1];
  setRound(round);
  // for each key in roundData animals
  Object.entries(roundData.animals).forEach(([animalType, count], j) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        spawnAnimal(animalType)
        if (i === count - 1 && Object.entries(roundData.animals).length - 1 === j) {
          areAnimalsLeft = false;
          console.log("No more animals left")
        }
      }, (10 * j) + i * (roundData.delay === "short" ? 1 : 5)); // Example delay between spawns, adjust as needed
    }
  });
}


function spawnAnimal(animalType: string) {
  if (animalType === "rat") {
    currentWorldData?.animals.push({
      id: Math.random().toString(),
      type: "rat",
      x: 0,
      y: 0,
      health: 100,
      nextPoint: 0,
      price: 20,
      lastShotBy: ""
    });
  } else if (animalType === "cat") {
    currentWorldData?.animals.push({
      id: Math.random().toString(),
      type: "cat",
      x: 0,
      y: 0,
      health: 500,
      nextPoint: 0,
      price: 100,
      lastShotBy: ""
    });
  } else if (animalType === "giraffe") {
    currentWorldData?.animals.push({
      id: Math.random().toString(),
      type: "giraffe",
      x: 0,
      y: 0,
      health: 1000,
      nextPoint: 0,
      price: 100,
      lastShotBy: ""
    });
  }
}

socket.on("killAnimal", (animalId) => {
  if (currentWorldData) {
    currentWorldData.animals = currentWorldData.animals.filter(
      (animal) => animal.id !== animalId
    );
    if (currentWorldData.animals.length == 0 && !areAnimalsLeft && isAdmin) {
      sendGameData(currentWorldData);
    }
  }
});

socket.on("placeBuilding", (building: Tower) => {
  if (currentWorldData) {
    currentWorldData.towers.push(building);
  }
});

socket.on("updateMoney", (data: {money: number, name: string}) => {
  if (currentWorldData) {
    currentWorldData.users = currentWorldData.users.map((user) => {
      if (user.name === data.name) {
        user.money = data.money;
      }
      return user;
    });
  }
});

socket.on("startGame", (numOfRounds: number) => {
  lobbyState.state = "playing";
  lobbyState.maxNumberOfRounds = numOfRounds;
  currentWorldData = {
    animals: [],
    towers: [],
    users: currentWorldData?.users || [],
  };
  startRound(lobbyState.round);
  hideStartGameButton();
});

socket.on("connect", () => {
  console.log("Connected to server yeeee");
  socket.emit("joinLobby", { username: socket.id, lobbyId: "lobby" });
});

socket.on("users", (users: User[]) => {
  if (!currentWorldData) {
    currentWorldData = {
      animals: [],
      towers: [],
      users: [],
    };
  }
  currentWorldData.users = users;
  for (const user of users) {
    if (user.name === socket.id && user.admin) {
      isAdmin = true
      setMoney(user.money);
    }
    if (user.name === socket.id) {
      setMoney(user.money);
    }
  }
});

socket.on("state", (state: "waiting" | "playing") => {
  lobbyState.state = state;
});

socket.on("newRound", (worldData: LobbyWorld) => {
  currentWorldData = worldData;
  lobbyState.round += 1;
  startRound(lobbyState.round);
});

