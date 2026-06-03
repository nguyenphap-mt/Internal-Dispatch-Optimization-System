import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleCode } from '../common/enums';
import { ROLE_PERMISSIONS } from '../common/permissions';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findByCode(code: string) {
    return this.repo.findOne({ where: { code } });
  }

  // Ensure the six PRD roles exist with their default permission sets.
  async ensureDefaults() {
    for (const code of Object.values(RoleCode)) {
      const existing = await this.repo.findOne({ where: { code } });
      const permissions = ROLE_PERMISSIONS[code];
      if (!existing) {
        await this.repo.save(
          this.repo.create({ code, name: code, permissions }),
        );
      }
    }
  }
}
