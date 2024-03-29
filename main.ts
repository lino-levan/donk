import { DiscordSDK } from "@discord/embedded-app-sdk";

const DISCORD_CLIENT_ID = Deno.env.get("DISCORD_CLIENT_ID")!;

const discordSdk = new DiscordSDK(DISCORD_CLIENT_ID);
await discordSdk.ready();

await discordSdk.commands.authorize({
  client_id: DISCORD_CLIENT_ID,
  response_type: "code",
  state: "",
  prompt: "none",
  scope: [
    "identify",
    "guilds",
  ],
});
