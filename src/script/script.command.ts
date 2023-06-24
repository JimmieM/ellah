import { baseEntityCommands, EntityCommand } from '../entity/base-commands';

export const scriptCommand = baseEntityCommands('script', [
   { command: EntityCommand.ls },
   { command: EntityCommand.add },
   { command: EntityCommand.edit },
   { command: EntityCommand.exec },
   { command: EntityCommand.mv },
   { command: EntityCommand.open },
   { command: EntityCommand.rm },
   { command: EntityCommand.cp },
]);
