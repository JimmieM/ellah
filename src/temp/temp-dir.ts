import os from 'os';
import path from 'path';
import { mkDir } from '../util/file.util.js';

export const tempDir = path.join(os.homedir(), '.ellah-cli', 'temp');

mkDir(tempDir);
