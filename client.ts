import * as esbuild from "npm:esbuild@0.20.2";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@^0.10.3";
import { serveDir } from "jsr:@std/http@0.221.0/file-server";
import { copySync } from "jsr:@std/fs@0.221.0/copy";


const IS_DEV = true;

let buildId = crypto.randomUUID();

if(IS_DEV) {
  Deno.serve((req)=>{
    if (new URL(req.url).pathname === "/reload") {
      let timerId: number | undefined = undefined;
      const body = new ReadableStream({
        start(controller) {
          controller.enqueue(`data: ${buildId}\nretry: 100\n\n`);
          timerId = setInterval(() => {
            controller.enqueue(`data: ${buildId}\n\n`);
          }, 1000);
        },
        cancel() {
          if (timerId !== undefined) {
            clearInterval(timerId);
          }
        },
      });
      return new Response(body.pipeThrough(new TextEncoderStream()), {
        headers: {
          "content-type": "text/event-stream",
        },
      });
    }

    return serveDir(req, {
      fsRoot: "./dist",
      quiet: true
    });
  })
}

async function build() {
  Deno.removeSync("./dist", { recursive: true });

  copySync("./client/public", "./dist");

  try {
    await new Deno.Command("deno", { args: ["task", "dev:style"]}).output();
    await esbuild.build({
      plugins: [...denoPlugins()],
      entryPoints: ["./client/main.ts"],
      outfile: "./dist/bundle.js",
      bundle: true,
      format: "esm",
    });

    if(IS_DEV) {
      buildId = crypto.randomUUID();
      Deno.writeTextFileSync("./dist/bundle.js", `new EventSource("/reload").addEventListener("message", function listener(e) { if (e.data !== "${buildId}") { this.removeEventListener('message', listener); location.reload(); } });\n` + Deno.readTextFileSync("./dist/bundle.js"))
    }
  } catch {
    // no-op
  }
}

await build();

const watcher = Deno.watchFs("./client");
for await (const _event of watcher) {
  await build();
}

esbuild.stop();
