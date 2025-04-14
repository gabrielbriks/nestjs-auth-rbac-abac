import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  //Quando o modulo do prisma estiver iniciando ele vai chamar o connect
  async onModuleInit() {
    await this.$connect();
  }
}
