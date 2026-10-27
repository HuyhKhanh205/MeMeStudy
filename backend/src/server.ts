import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`MeMeStudy API đang chạy tại http://localhost:${env.port}/api`);
});
