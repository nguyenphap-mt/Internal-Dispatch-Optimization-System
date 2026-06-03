import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../common/decorators';
import { PointType, RequestStatus } from '../common/enums';
import { Permission } from '../common/permissions';
import { DispatchPoint } from '../dispatch-points/entities/dispatch-point.entity';
import { CreateDispatchRequestDto, UpdateDispatchRequestDto } from './dto';
import { DispatchRequest } from './entities/dispatch-request.entity';

export interface RequestFilter {
  status?: RequestStatus;
  created_by?: string;
  priority?: string;
}

@Injectable()
export class DispatchRequestsService {
  constructor(
    @InjectRepository(DispatchRequest)
    private readonly repo: Repository<DispatchRequest>,
  ) {}

  private async nextCode(): Promise<string> {
    const count = await this.repo.count();
    return `YC${String(count + 1).padStart(6, '0')}`;
  }

  async create(dto: CreateDispatchRequestDto, user: AuthUser) {
    const points = (dto.points ?? []).map((p) =>
      Object.assign(new DispatchPoint(), {
        point_type: p.point_type,
        location_name: p.location_name,
        address: p.address,
        lat: p.lat,
        lng: p.lng,
        contact_name: p.contact_name,
        contact_phone: p.contact_phone,
        time_window_start: p.time_window_start
          ? new Date(p.time_window_start)
          : null,
        time_window_end: p.time_window_end
          ? new Date(p.time_window_end)
          : null,
        service_time_minutes: p.service_time_minutes ?? 10,
      }),
    );

    const request = this.repo.create({
      request_code: await this.nextCode(),
      request_type: dto.request_type,
      priority: dto.priority,
      status: RequestStatus.DRAFT,
      created_by: user.id,
      department: dto.department ?? user.department,
      cargo_type: dto.cargo_type,
      weight_kg: dto.weight_kg,
      volume_m3: dto.volume_m3 ?? 0,
      is_bulky: dto.is_bulky ?? false,
      cargo_value: dto.cargo_value,
      fragile: dto.fragile ?? false,
      is_vip: dto.is_vip ?? false,
      inner_city: dto.inner_city ?? true,
      area: dto.area,
      note: dto.note,
      points,
    });
    return this.repo.save(request);
  }

  findAll(filter: RequestFilter = {}) {
    const where: Record<string, unknown> = {};
    if (filter.status) where.status = filter.status;
    if (filter.created_by) where.created_by = filter.created_by;
    if (filter.priority) where.priority = filter.priority;
    return this.repo.find({ where, order: { created_at: 'DESC' } });
  }

  // Requests visible to a user: dispatchers/managers/admins see all; creators
  // (Sales/Purchasing) only see their own (PRD section 5).
  visibleFor(user: AuthUser, filter: RequestFilter = {}) {
    if (user.permissions.includes(Permission.REQUEST_VIEW_ALL)) {
      return this.findAll(filter);
    }
    return this.findAll({ ...filter, created_by: user.id });
  }

  async findOne(id: string) {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('Không tìm thấy yêu cầu');
    return req;
  }

  async update(id: string, dto: UpdateDispatchRequestDto, user: AuthUser) {
    const req = await this.findOne(id);
    const canEditAll = user.permissions.includes(Permission.REQUEST_EDIT);
    if (!canEditAll && req.created_by !== user.id) {
      throw new ForbiddenException('Không thể sửa yêu cầu của người khác');
    }
    // BR-DIS: once dispatched, only dispatchers may edit.
    if (
      !canEditAll &&
      ![RequestStatus.DRAFT, RequestStatus.SUBMITTED].includes(req.status)
    ) {
      throw new ForbiddenException(
        'Yêu cầu đã được điều phối, cần quyền dispatcher để sửa',
      );
    }
    Object.assign(req, {
      request_type: dto.request_type ?? req.request_type,
      priority: dto.priority ?? req.priority,
      cargo_type: dto.cargo_type ?? req.cargo_type,
      weight_kg: dto.weight_kg ?? req.weight_kg,
      volume_m3: dto.volume_m3 ?? req.volume_m3,
      is_bulky: dto.is_bulky ?? req.is_bulky,
      is_vip: dto.is_vip ?? req.is_vip,
      inner_city: dto.inner_city ?? req.inner_city,
      area: dto.area ?? req.area,
      note: dto.note ?? req.note,
    });
    return this.repo.save(req);
  }

  // Validate BR-DATA rules required to submit (PRD section 9.1). Coordinates are
  // NOT required here (BR-DATA-004 only flags un-geocoded addresses later).
  private validateForSubmit(req: DispatchRequest): string[] {
    const errors: string[] = [];
    const needsPickup = req.points.some((p) => p.point_type === PointType.PICKUP);
    const needsDelivery = req.points.some(
      (p) => p.point_type === PointType.DELIVERY,
    );
    if (!needsPickup && !needsDelivery) {
      errors.push('BR-DATA-001: thiếu điểm lấy/giao');
    }
    if (!(Number(req.weight_kg) > 0)) {
      errors.push('BR-DATA-003: thiếu khối lượng'); // BR-DATA-003
    }
    for (const p of req.points) {
      if (!p.address) errors.push(`BR-DATA-001: điểm ${p.point_type} thiếu địa chỉ`);
      if (!p.contact_phone)
        errors.push(`BR-DATA-005: điểm ${p.point_type} thiếu SĐT liên hệ`); // BR-DATA-005
      if (!p.time_window_start || !p.time_window_end) {
        errors.push(`BR-DATA-002: điểm ${p.point_type} thiếu thời gian`); // BR-DATA-002
      } else {
        if (
          new Date(p.time_window_end).getTime() <=
          new Date(p.time_window_start).getTime()
        ) {
          errors.push('BR-DATA-006: thời gian kết thúc phải lớn hơn bắt đầu');
        }
        if (new Date(p.time_window_end).getTime() < Date.now()) {
          errors.push('BR-DATA-007: deadline trong quá khứ'); // BR-DATA-007
        }
      }
    }
    return errors;
  }

  async submit(id: string, user: AuthUser) {
    const req = await this.findOne(id);
    if (req.created_by !== user.id && !user.permissions.includes(Permission.REQUEST_EDIT)) {
      throw new ForbiddenException('Không thể gửi yêu cầu của người khác');
    }
    if (req.status !== RequestStatus.DRAFT && req.status !== RequestStatus.SUBMITTED) {
      throw new BadRequestException('Chỉ gửi được yêu cầu ở trạng thái nháp');
    }
    const errors = this.validateForSubmit(req);
    if (errors.length > 0) {
      throw new BadRequestException({ message: 'Dữ liệu chưa hợp lệ', errors });
    }
    req.status = RequestStatus.WAITING_DISPATCH;
    return this.repo.save(req);
  }

  async cancel(id: string, user: AuthUser, reason?: string) {
    const req = await this.findOne(id);
    const isOwner = req.created_by === user.id;
    const canCancelOwn = user.permissions.includes(Permission.REQUEST_CANCEL_OWN);
    const isDispatcher = user.permissions.includes(Permission.ROUTE_CANCEL);
    if (!(isDispatcher || (isOwner && canCancelOwn))) {
      throw new ForbiddenException('Không có quyền hủy yêu cầu này');
    }
    // Owners can only cancel before dispatch (PRD section 5.1).
    const cancellable = [
      RequestStatus.DRAFT,
      RequestStatus.SUBMITTED,
      RequestStatus.WAITING_DISPATCH,
    ];
    if (!isDispatcher && !cancellable.includes(req.status)) {
      throw new BadRequestException('Yêu cầu đã được điều phối, không thể hủy');
    }
    req.status = RequestStatus.CANCELLED;
    if (reason) req.note = `${req.note ?? ''}\n[Hủy] ${reason}`.trim();
    return this.repo.save(req);
  }

  // Used by the routing engine: requests awaiting dispatch.
  waitingForDispatch() {
    return this.repo.find({
      where: { status: RequestStatus.WAITING_DISPATCH },
      order: { created_at: 'ASC' },
    });
  }

  saveAll(reqs: DispatchRequest[]) {
    return this.repo.save(reqs);
  }

  async setStatus(ids: string[], status: RequestStatus) {
    if (ids.length === 0) return;
    await this.repo
      .createQueryBuilder()
      .update(DispatchRequest)
      .set({ status })
      .whereInIds(ids)
      .execute();
  }

  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return this.repo.findByIds(ids);
  }
}
