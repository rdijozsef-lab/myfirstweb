import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sqliteSchemaPath = path.join(root, 'prisma', 'schema.prisma');
const postgresSchemaPath = path.join(root, 'prisma', 'schema.postgres.prisma');

const sqliteSchema = readFileSync(sqliteSchemaPath, 'utf8');

const postgresSchema = sqliteSchema.replace(
  /datasource db \{\r?\n\s+provider = "sqlite"\r?\n\s+url\s+= env\("DATABASE_URL"\)\r?\n\}/,
  [
    'datasource db {',
    '  provider = "postgresql"',
    '  url      = env("DATABASE_URL")',
    '}',
  ].join('\n'),
);

writeFileSync(postgresSchemaPath, postgresSchema, 'utf8');

console.log(`Generated ${path.relative(root, postgresSchemaPath)}`);
