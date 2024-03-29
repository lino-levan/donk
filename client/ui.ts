import { startGame } from "./socket.ts";
import { controls } from "./controls.ts";

export let selectedTower: "house" | "irs" | "gas" = "house";

const startGameButton = document.getElementById("start-game")! as HTMLButtonElement;
const gameUI = document.getElementById("game-ui")!;

export function hideStartGameButton() {
  startGameButton.classList.add('hidden');
  gameUI.classList.remove('hidden');
}

export function showStartGameButton() {
  startGameButton.classList.remove('hidden');
  gameUI.classList.add('hidden');
}

export function setMoney(money: number) {
  document.getElementById("money")!.innerText = money.toString();
}

export function setLives(lives: number) {
  document.getElementById("lives")!.innerText = lives.toString();
}

export function setRound(round: number) {
  document.getElementById("round")!.innerText = round.toString();
}

startGameButton.addEventListener('click', () => {
  startGame(20);
});

document.getElementById("house")!.addEventListener('click', () => {
  controls.building = true;
  selectedTower = "house";
});

document.getElementById("irs")!.addEventListener('click', () => {
  controls.building = true;
  selectedTower = "irs";
});

document.getElementById("gas")!.addEventListener('click', () => {
  controls.building = true;
  selectedTower = "gas";
});
