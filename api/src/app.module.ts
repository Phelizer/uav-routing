import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SolverModule } from './solver/solver.module';

@Module({
  imports: [SolverModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
