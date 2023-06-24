import { PrismaClient } from '@prisma/client';
import { loadConfig } from '../config/user-config';

const config = loadConfig();

export default new PrismaClient({
   datasources: {
      db: {
         url: `postgresql://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.database}?schema=public`,
      },
   },
});
