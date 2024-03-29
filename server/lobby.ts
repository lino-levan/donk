import { LobbyWorld } from "./types.ts";
import { User } from "./types.ts";
const INITIAL_MONEY = 1000;

export default class Lobby {
  public id: string;
  users: User[] = [];
  gameStarted: boolean = false;

  constructor(id: string) {
    this.id = id;
  }

  step() {
    console.log("Lobby step");
  }

  addUser(user: string, socket: any, isAdmin: boolean): boolean {
    if (this.gameStarted) {
      return false;
    }
    this.users.push({
      name: user,
      ready: false,
      admin: isAdmin,
      socket,
      money: INITIAL_MONEY,
    });
    return true;
  }

  removeUser(socket: any): boolean {
    const userIndex = this.users.findIndex((user) => user.socket === socket);
    if (userIndex !== -1) {
      if (this.users[userIndex].admin) {
        this.users.forEach((user) => {
          if (!user.admin) {
            user.admin = true;
            return;
          }
        });
      }
      this.users.splice(userIndex, 1);
      return true;
    }
    return false;
  }

  getUsers(): User[] {
    // return everything but the socket on the user
    return this.users.map((user) => {
      return {
        ...user,
        socket: null,
      };
    });
  }

  beginGame(username: string): boolean {
    const user = this.users.find((user) => user.name === username);
    user?.money === INITIAL_MONEY;
    if (user && user.admin) {
      this.gameStarted = true;
      return true;
    }
    return false;
  }
}
