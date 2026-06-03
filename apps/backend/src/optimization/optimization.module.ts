import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptimizationRun } from './entities/optimization-run.entity';
import { OptimizationService } from './optimization.service';

@Module({
  imports: [TypeOrmModule.forFeature([OptimizationRun])],
  providers: [OptimizationService],
  exports: [OptimizationService],
})
export class OptimizationModule {}
