import { Server } from "https://deno.land/x/socket_io@0.1.1/mod.ts";
import Manager from "./manager.ts";
import { LobbyWorld, Tower } from "./types.ts";

export const io = new Server({
  cors: {
    origin: true,
    credentials: true,
  },
});

const manager = new Manager();

io.on("connection", (socket: any) => {
  console.log(`socket ${socket.id} connected`);

  socket.on("disconnect", (reason: string) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
    manager.removeUser(socket);
  });

  socket.on("joinLobby", (data: {
    username: string;
    lobbyId: string;
  }) => {
    const { username, lobbyId } = data;
    console.log(`${username} joined lobby ${lobbyId}`);

    socket.join(lobbyId);
    manager.addUser(lobbyId, username, socket);
    io.to(lobbyId).emit("users", manager.getUserData(lobbyId));
  });

  socket.on("startGame", (data: {
    lobbyId: string;
    numOfRounds: number;
  }) => {
    const { lobbyId, numOfRounds } = data;
    console.log(`Game started in lobby ${lobbyId}`);
    const worked = manager.beginGame(lobbyId, socket.id);
    if (!worked) {
      console.log(`Game could not start in lobby ${lobbyId}`);
      return;
    }
    io.to(lobbyId).emit("startGame", numOfRounds);
    io.to(lobbyId).emit("users", manager.getUserData(lobbyId));
  });

  socket.on("newWorldData", (data: {
    worldData: LobbyWorld;
    lobbyId: string;
  }) => {
    const { worldData, lobbyId } = data;
    console.log(`Received new world data: ${worldData}`);
    io.to(lobbyId).emit("newRound", worldData);
  });
  
  socket.on("killAnimal", (data: {
    lobbyId: string;
    animalId: string;
  }) => {
    const { lobbyId, animalId } = data;
    io.to(lobbyId).emit("killAnimal", animalId);
  });

  socket.on("placeBuilding", (data: {
    lobbyId: string;
    building: Tower;
  }) => {
    const { lobbyId, building } = data;
    io.to(lobbyId).emit("placeBuilding", building);
  });

  socket.on("updateMoney", (data: {
    lobbyId: string;
    money: number;
  }) => {
    const { lobbyId, money } = data;
    io.to(lobbyId).emit("updateMoney", { money, name: socket.id });
  });
});
