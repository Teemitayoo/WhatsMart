import * as dotenv from 'dotenv';

dotenv.config();
import 'reflect-metadata';
import app from './app';
//import logger from './utils/logging/winston';
import { Prisma } from './database/prisma.service';
import { Application } from 'express';

class Server {
  private port = process.env.PORT || 8000;
  private app;
  private prisma = new Prisma();
  constructor(app: Application) {
    this.app = app;
  }

  start() {
    this.prisma.connectDB();
    this.app.listen(this.port, () => {
      console.log(`Listening on url http://localhost:${this.port}`);
    });
  }
}

const server = new Server(app);
server.start();
