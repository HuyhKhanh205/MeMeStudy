import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:8081')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
