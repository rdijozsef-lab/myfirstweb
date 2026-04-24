import { spawnSync } from 'node:child_process';
import { syncPostgresSchema } from './sync-prisma-postgres';

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const databaseUrl = process.env.DATABASE_URL ?? '';
const isPostgres = /^postgres(ql)?:\/\//i.test(databaseUrl);
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

if (isPostgres) {
  syncPostgresSchema();
  run(npxCommand, ['prisma', 'generate', '--schema', 'prisma/schema.postgres.prisma']);
} else {
  run(npxCommand, ['prisma', 'generate']);
}
