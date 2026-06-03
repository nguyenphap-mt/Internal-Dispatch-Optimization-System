import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto, UpdateVehicleDto } from './dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repo: Repository<Vehicle>,
  ) {}

  findAll(activeOnly = false) {
    return this.repo.find({
      where: activeOnly ? { active: true } : {},
      order: { vehicle_code: 'ASC' },
    });
  }

  async findOne(id: string) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Không tìm thấy xe');
    return v;
  }

  create(dto: CreateVehicleDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const v = await this.findOne(id);
    Object.assign(v, dto);
    return this.repo.save(v);
  }

  // Soft-disable a vehicle (PRD: "Ngưng sử dụng xe").
  async deactivate(id: string) {
    const v = await this.findOne(id);
    v.active = false;
    return this.repo.save(v);
  }
}
