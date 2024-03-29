import Lobby from "./lobby.ts";
import { LobbyWorld } from "./types.ts";
import { User } from "./types.ts";

export default class Manager {
  private lobbies: {
    [key: string]: Lobby;
  } = {};
  private intervalId: number | null = null;

  addUser(lobbyId: string, name: string, socket: any): boolean {
    let isAdmin = false;
    let lobby: Lobby | null = this.lobbies[lobbyId];
    if (!lobby) {
      lobby = this.createLobby(lobbyId);
      isAdmin = true;
    }
    if (!lobby) {
      console.error(`Failed to create or retrieve lobby with id ${lobbyId}`);
      return false;
    }
    lobby.addUser(name, socket, isAdmin);
    console.log(`Added user ${name} to lobby ${lobbyId}`);
    return isAdmin;
  }

  removeUser(socket: any) {
    for (const lobbyId in this.lobbies) {
      const lobby = this.lobbies[lobbyId];
      if (lobby.removeUser(socket)) {
        console.log(`Removed user from lobby ${lobby.id}`);
        if (lobby.getUsers().length === 0) {
          this.removeLobby(lobby.id);
        }
        return;
      }
    }
  }

  createLobby(id: string): Lobby | null {
    if (this.lobbies[id]) {
      console.error(`Lobby with id ${id} already exists.`);
      return null;
    }
    const newLobby = new Lobby(id);
    this.lobbies[id] = newLobby;
    console.log(`Created lobby with id ${id}`);
    return newLobby;
  }

  removeLobby(id: string): void {
    if (!this.lobbies[id]) {
      console.error(`Lobby with id ${id} does not exist.`);
      return;
    }
    delete this.lobbies[id];
    console.log(`Removed lobby with id ${id}`);
  }

  getUserData(lobbyId: string): User[] {
    const lobby = this.lobbies[lobbyId];
    if (!lobby) {
      console.error(`Lobby with id ${lobbyId} does not exist.`);
      return [];
    }
    return lobby.getUsers();
  }

  beginGame(lobbyId: string, username: string): boolean {
    const lobby = this.lobbies[lobbyId];
    if (!lobby) {
      console.error(`Lobby with id ${lobbyId} does not exist.`);
      return false;
    }
    return lobby.beginGame(username);
  }
}
