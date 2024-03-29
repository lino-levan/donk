export type Mob = {
  id: string;
  type: "rat" | "cat" | "giraffe";
  x: number;
  y: number;
  health: number;
  nextPoint: number;
  price: number;
  lastShotBy: string;
};

export type Tower = {
  type: "house" | "irs" | "gas";
  x: number;
  y: number;
  cooldown: number;
  cost: number;
  owner: string;
}

export interface LobbyWorld {
  towers: Tower[];
  animals: Mob[];
  users: User[];
}

export interface User {
  name: string;
  ready: boolean;
  admin: boolean;
  socket?: any;
  money: number;
}
