import { Server } from "https://deno.land/x/socket_io@0.2.0/mod.ts";
import { io } from "./socket.ts";

// @ts-ignore we so silly :
Deno.serve({
  port: 3000,
}, io.handler());
