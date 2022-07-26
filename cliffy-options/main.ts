import { Command } from "https://deno.land/x/cliffy@v0.24.2/command/mod.ts";

export const createCmd = new Command()
  .name("my-command")
  .version("1.0.0")
  .description("Do something.")
  .option("--color <color>", "Color name.")
  .option("--no-check", "No check.")
  .option("--check", "No check.")
  .action((args) => {
    console.log(args);
    console.log("Hello world!");
  })
  .parse(Deno.args);
