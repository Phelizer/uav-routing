import { Module } from '@nestjs/common';
import { SolverController } from './solver.controller';
import { SolverService } from './solver.service';
import { DbModule } from 'src/db/db.module';

@Module({
  controllers: [SolverController],
  providers: [SolverService],
  imports: [DbModule],
})
export class SolverModule {}
