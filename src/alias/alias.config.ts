import { buildPath } from '../util/path.util';
import os from 'os';
const baseDir = buildPath(os.homedir(), '.ellah-cli');

export const ellahAlias = buildPath(baseDir, 'alias');
