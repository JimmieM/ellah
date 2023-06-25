import fs from 'fs';
import { emptyUserConfig } from './empty-user-config.js';
import { UserConfig } from './user-config.model.js';
import path from 'path';
import os from 'os';

const configDir = path.join(os.homedir(), '.ellah-cli');
const configPath = path.join(configDir, 'config.json');

// Create the config directory if it does not exist
if (!fs.existsSync(configPath)) {
   fs.mkdirSync(configDir, { recursive: true });
   fs.writeFileSync(configPath, JSON.stringify(emptyUserConfig), 'utf8');
}

export function loadConfig(): UserConfig {
   try {
      const data = fs.readFileSync(configPath, 'utf8');
      if (!data) return emptyUserConfig;
      return JSON.parse(data);
   } catch (err) {
      console.error('Error loading state:', err);
      return emptyUserConfig;
   }
}

export function saveConfig(state: UserConfig) {
   try {
      const data = JSON.stringify(state);
      fs.writeFileSync(configPath, data, 'utf8');
   } catch (err) {
      console.error('Error saving state:', err);
   }
}

export function setConfig(
   config: UserConfig,
   key: string,
   value: string,

   paths: any[][],
): UserConfig {
   const copyConfig = JSON.parse(JSON.stringify(config));

   let match = false;

   paths.forEach((val) => {
      if (key !== val[0]) return;

      match = true;

      const path = val[1];
      setDeepValue(copyConfig, path, value);
   });

   if (!match) {
      console.warn(`No such key ${key}`);
   }

   return copyConfig;
}

function setDeepValue(obj: any, path: any[], value: any) {
   if (path.length === 1) {
      obj[path[0]] = value;
   } else {
      const nextPath = path.shift();
      if (!obj[nextPath]) {
         obj[nextPath] = {};
      }
      setDeepValue(obj[nextPath], path, value);
   }
}
