import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  //Quando o modulo do prisma estiver iniciando ele vai chamar o connect
  async onModuleInit() {
    await this.$connect();
  }
}
