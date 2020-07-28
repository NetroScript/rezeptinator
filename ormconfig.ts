import { ConnectionOptions } from 'typeorm';

const config: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 44444,
  username: 'postgresqluser',
  password: ";*TcoAU6,-zrHLBh6-(MO/']e.-E`*7LV[;@&7Tb",
  database: 'rezepte',
  synchronize: true,
};

export default config;
