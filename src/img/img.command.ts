import { baseEntityCommands, EntityCommand } from '../entity/base-commands';

export const imageCommand = baseEntityCommands('img', [
   { command: EntityCommand.ls },
   { command: EntityCommand.add },
   { command: EntityCommand.mv },
   { command: EntityCommand.open },
   { command: EntityCommand.rm },
]);
