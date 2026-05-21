import pc from "picocolors";

function write(line: string): void {
  process.stdout.write(line + "\n");
}

export const log = {
  info(msg: string): void {
    write(pc.white("  " + msg));
  },
  warn(msg: string): void {
    write(pc.yellow("WARN  " + msg));
  },
  error(msg: string): void {
    write(pc.red("ERROR  " + msg));
  },
  success(msg: string): void {
    write(pc.green("OK    " + msg));
  },
};
