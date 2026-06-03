import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto, UpdateDriverDto } from './dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly repo: Repository<Driver>,
  ) {}

  findAll(activeOnly = false) {
    return this.repo.find({
      where: activeOnly ? { active: true } : {},
      order: { full_name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const d = await this.repo.findOne({ where: { id } });
    if (!d) throw new NotFoundException('Không tìm thấy tài xế');
    return d;
  }

  findByUserId(userId: string) {
    return this.repo.findOne({ where: { user_id: userId } });
  }

  create(dto: CreateDriverDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateDriverDto) {
    const d = await this.findOne(id);
    Object.assign(d, dto);
    return this.repo.save(d);
  }
}
