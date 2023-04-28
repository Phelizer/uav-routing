import { Module } from '@nestjs/common';
import { SolverController } from './solver.controller';
import { SolverService } from './solver.service';

@Module({
  controllers: [SolverController],
  providers: [SolverService],
})
export class SolverModule {}
