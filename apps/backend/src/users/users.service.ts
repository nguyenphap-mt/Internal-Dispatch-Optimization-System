import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findAll() {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  async create(dto: CreateUserDto) {
    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({
      full_name: dto.full_name,
      email: dto.email,
      phone: dto.phone,
      password_hash,
      role_id: dto.role_id,
      department: dto.department,
      active: dto.active ?? true,
    });
    return this.repo.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (dto.password) {
      user.password_hash = await bcrypt.hash(dto.password, 10);
    }
    Object.assign(user, {
      full_name: dto.full_name ?? user.full_name,
      email: dto.email ?? user.email,
      phone: dto.phone ?? user.phone,
      role_id: dto.role_id ?? user.role_id,
      department: dto.department ?? user.department,
      active: dto.active ?? user.active,
    });
    return this.repo.save(user);
  }
}
