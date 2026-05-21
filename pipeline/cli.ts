import { Command } from "commander";
import { registerIngest } from "./commands/ingest";

const program = new Command();

program
  .name("pipeline")
  .description("Changemaker scoring pipeline CLI")
  .version("0.1.0");

registerIngest(program);

program.parseAsync().catch((err: unknown) => {
  console.error(String(err));
  process.exit(1);
});
