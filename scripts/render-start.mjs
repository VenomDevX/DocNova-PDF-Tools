import { spawnSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const backendDir = join(process.cwd(), "backend");
const requirementsPath = join(backendDir, "requirements.txt");
const port = process.env.PORT || "5000";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

if (!existsSync(requirementsPath)) {
  console.error("Missing backend/requirements.txt");
  process.exit(1);
}

run("python", ["-m", "pip", "install", "-r", requirementsPath]);

const gunicorn = spawn(
  "python",
  [
    "-m",
    "gunicorn",
    "--workers",
    "4",
    "--worker-class",
    "sync",
    "--bind",
    `0.0.0.0:${port}`,
    "--timeout",
    "120",
    "app:app",
  ],
  {
    cwd: backendDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

gunicorn.on("exit", code => {
  process.exit(code || 0);
});
