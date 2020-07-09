// deno run --allow-run index.ts

// create subprocess
const p = Deno.run({
  cmd: ["echo", "hello"],
});

// await its completion
await p.status();
