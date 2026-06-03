import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_ROUTING_CONFIG, RoutingConfig } from '../routing/engine/config';
import { GeoPoint } from '../routing/engine/types';
import { SystemSetting } from './entities/system-setting.entity';

export const ROUTING_CONFIG_KEY = 'routing_config';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly repo: Repository<SystemSetting>,
  ) {}

  async getValue<T>(key: string, fallback: T): Promise<T> {
    const row = await this.repo.findOne({ where: { key } });
    return row ? (row.value as T) : fallback;
  }

  async setValue(key: string, value: unknown, description?: string) {
    let row = await this.repo.findOne({ where: { key } });
    if (!row) {
      row = this.repo.create({ key, value, description });
    } else {
      row.value = value;
      if (description) row.description = description;
    }
    await this.repo.save(row);
    return row;
  }

  async getRoutingConfig(): Promise<RoutingConfig> {
    const stored = await this.getValue<Partial<RoutingConfig>>(
      ROUTING_CONFIG_KEY,
      {},
    );
    return { ...DEFAULT_ROUTING_CONFIG, ...stored };
  }

  async updateRoutingConfig(
    patch: Partial<RoutingConfig>,
  ): Promise<RoutingConfig> {
    const current = await this.getRoutingConfig();
    const next = { ...current, ...patch };
    await this.setValue(ROUTING_CONFIG_KEY, next, 'Routing engine configuration');
    return next;
  }

  async getDepot(): Promise<GeoPoint> {
    const cfg = await this.getRoutingConfig();
    return {
      lat: cfg.default_depot_lat ?? 21.0278,
      lng: cfg.default_depot_lng ?? 105.8342,
    };
  }

  list() {
    return this.repo.find();
  }
}
