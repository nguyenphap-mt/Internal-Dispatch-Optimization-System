import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OptimizationRun } from './entities/optimization-run.entity';

@Injectable()
export class OptimizationService {
  constructor(
    @InjectRepository(OptimizationRun)
    private readonly repo: Repository<OptimizationRun>,
  ) {}

  private async nextCode(): Promise<string> {
    const count = await this.repo.count();
    return `RUN${String(count + 1).padStart(6, '0')}`;
  }

  async record(params: {
    runType: string;
    input: unknown;
    output: unknown;
    totalCost: number;
    totalDistanceKm: number;
    totalDurationMinutes: number;
    createdBy?: string;
  }): Promise<OptimizationRun> {
    const run = this.repo.create({
      run_code: await this.nextCode(),
      run_type: params.runType,
      input_snapshot: params.input,
      output_snapshot: params.output,
      total_cost: params.totalCost,
      total_distance_km: params.totalDistanceKm,
      total_duration_minutes: params.totalDurationMinutes,
      created_by: params.createdBy,
    });
    return this.repo.save(run);
  }

  findAll() {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }
}
