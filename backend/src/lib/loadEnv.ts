import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

let loaded = false;

function findBackendDir(startDir: string): string {
  let currentDir = startDir;

  while (true) {
    if (fs.existsSync(path.join(currentDir, 'prisma', 'schema.prisma'))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return process.cwd();
    }
    currentDir = parentDir;
  }
}

function existingEnvPaths(): string[] {
  const backendDir = findBackendDir(__dirname);
  const candidates = [
    path.resolve(backendDir, '.env.local'),
    path.resolve(backendDir, '.env'),
  ];

  // Claude worktrees often keep the real backend env in the repo's main backend folder.
  if (backendDir.includes(`${path.sep}.claude${path.sep}worktrees${path.sep}`)) {
    candidates.push(
      path.resolve(backendDir, '..', '..', '..', '..', 'backend', '.env.local'),
      path.resolve(backendDir, '..', '..', '..', '..', 'backend', '.env')
    );
  }

  return candidates.filter((candidate, index, all) => all.indexOf(candidate) === index && fs.existsSync(candidate));
}

export function loadEnv(): void {
  if (loaded) return;

  for (const envPath of existingEnvPaths()) {
    dotenv.config({ path: envPath, override: false });
  }

  loaded = true;
}

loadEnv();
