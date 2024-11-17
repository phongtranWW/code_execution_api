import { registerAs } from '@nestjs/config';

export default registerAs('api', () => ({
  key: process.env.API_KEY,
  port: process.env.API_PORT || 3000,
  prefix: process.env.API_PREFIX,
  version: process.env.API_VERSION,
}));
