import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import os from 'os';

// Location of the config directory and file
const configDir = path.join(os.homedir(), '.ellah-cli');
const configPath = path.join(configDir, 'config.json');

function loadConfig() {
   try {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
   } catch (err) {
      console.error('Error loading state:', err);
      return {
         db: null,
      };
   }
}

const dbConfig = loadConfig().db;

if (dbConfig) {
   // Generate the schema.prisma content with the dynamic database URL
   const schemaContent = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url = "postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}"
}

model Link {
  id      Int      @id @default(autoincrement())
  name   String   @unique
  link    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;

   // Write the schema.prisma file
   fs.writeFileSync('schema.prisma', schemaContent);

   // Execute the desired Prisma command using the updated schema.prisma file
   execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
}
