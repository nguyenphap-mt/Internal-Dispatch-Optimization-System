import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { PlannedStop, RoutePlan } from '../core/models';

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Tuyến của tôi hôm nay</h1>
    <p class="muted" *ngIf="!routes.length">Không có tuyến nào được phân cho bạn hôm nay.</p>

    <div class="card" *ngFor="let r of routes">
      <div class="row" style="justify-content:space-between">
        <h2 style="margin:0">{{ r.route_code }} — {{ r.vehicle?.vehicle_code }}</h2>
        <div class="row">
          <span class="badge Groupable">{{ r.status }}</span>
          <button *ngIf="r.status === 'Assigned'" (click)="start(r)">Bắt đầu</button>
        </div>
      </div>
      <table style="margin-top:10px">
        <thead><tr><th>#</th><th>Loại</th><th>Điểm</th><th>Giờ</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
        <tbody>
          <tr *ngFor="let s of r.stops">
            <td>{{ s.stop_sequence }}</td>
            <td>{{ s.point_type }}</td>
            <td>{{ s.location_name }}</td>
            <td>{{ s.planned_arrival_time | date: 'HH:mm' }}</td>
            <td>{{ s.status }}</td>
            <td>
              <div class="row" style="gap:6px" *ngIf="r.status === 'InProgress'">
                <button class="secondary" (click)="arrived(s, r)" [disabled]="s.status !== 'Pending'">Đã đến</button>
                <button (click)="done(s, r)" [disabled]="s.status === 'PickupCompleted' || s.status === 'DeliveryCompleted'">
                  {{ s.point_type === 'Pickup' ? 'Đã lấy' : 'Đã giao' }}
                </button>
                <button class="danger" (click)="fail(s, r)">Lỗi</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="error" *ngIf="error">{{ error }}</div>
  `,
})
export class DriverComponent implements OnInit {
  routes: RoutePlan[] = [];
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.driverToday().subscribe((r) => (this.routes = r));
  }

  start(r: RoutePlan): void {
    this.api.startRoute(r.id).subscribe({ next: () => this.load(), error: (e) => this.show(e) });
  }

  arrived(s: PlannedStop, r: RoutePlan): void {
    this.api.stopArrived(s.id!).subscribe({ next: () => this.load(), error: (e) => this.show(e) });
  }

  done(s: PlannedStop, r: RoutePlan): void {
    const obs =
      s.point_type === 'Pickup'
        ? this.api.stopPickup(s.id!)
        : this.api.stopDelivery(s.id!);
    obs.subscribe({ next: () => this.load(), error: (e) => this.show(e) });
  }

  fail(s: PlannedStop, r: RoutePlan): void {
    const reason = prompt('Lý do thất bại?') ?? 'Không rõ';
    this.api.stopFailed(s.id!, reason).subscribe({ next: () => this.load(), error: (e) => this.show(e) });
  }

  private show(e: { error?: { message?: string } }): void {
    this.error = e?.error?.message ?? 'Thao tác thất bại';
  }
}
