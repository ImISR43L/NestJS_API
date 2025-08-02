// src/habit/habit.module.ts
import { Module } from '@nestjs/common';
import { HabitService } from './habit.service';
import { HabitController } from './habit.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module'; // Import UserModule if needed

@Module({
  imports: [UserModule], // Importing UserModule might be useful later
  controllers: [HabitController],
  providers: [HabitService, PrismaService],
})
export class HabitModule {}
