// deno run --allow-run sub-cat.ts /etc/passwd

const fileNames = Deno.args;

const p2 = Deno.run({
  cmd: [
    "deno",
    "run",
    "--allow-read",
    "https://deno.land/std/examples/cat.ts",
    ...fileNames,
  ],
  stdout: "piped",
  stderr: "piped",
});

const { code } = await p2.status();

if (code === 0) {
  const rawOutput = await p2.output();
  await Deno.stdout.write(rawOutput);
} else {
  const rawError = await p2.stderrOutput();
  const errorString = new TextDecoder().decode(rawError);
  console.log(errorString);
}

Deno.exit(code);
