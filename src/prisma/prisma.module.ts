import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // thanks to this decorator, this prisma service will be available to all the module in our app
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
