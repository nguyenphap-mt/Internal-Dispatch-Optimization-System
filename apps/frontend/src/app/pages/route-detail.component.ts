import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Driver, RoutePlan } from '../core/models';

@Component({
  selector: 'app-route-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row" style="justify-content:space-between">
      <h1>Tuyến {{ plan?.route_code }}</h1>
      <button class="secondary" (click)="back()">← Danh sách</button>
    </div>

    <div class="card" *ngIf="plan">
      <div class="grid cols-4">
        <div class="metric"><div class="value">{{ plan.estimated_distance_km }} km</div><div class="label">Quãng đường</div></div>
        <div class="metric"><div class="value">{{ plan.estimated_cost | number }}</div><div class="label">Chi phí (đ)</div></div>
        <div class="metric"><div class="value">{{ plan.estimated_duration_minutes }}'</div><div class="label">Thời gian</div></div>
        <div class="metric"><div class="value">{{ plan.status }}</div><div class="label">Trạng thái</div></div>
      </div>
      <p style="margin-top:12px"><strong>Xe:</strong> {{ plan.vehicle?.vehicle_code }} ({{ plan.vehicle?.vehicle_type }})
        &nbsp; <strong>Tài xế:</strong> {{ plan.driver?.full_name || 'Chưa phân' }}</p>
      <p class="muted" *ngIf="plan.explanation">{{ plan.explanation }}</p>
      <div class="error" *ngIf="plan.warnings?.length">
        <ul><li *ngFor="let w of plan.warnings">{{ w }}</li></ul>
      </div>
    </div>

    <div class="card" *ngIf="plan">
      <h2>Thao tác điều phối</h2>
      <div class="row" style="flex-wrap:wrap;gap:10px">
        <button (click)="approve()" [disabled]="plan.status !== 'Draft'">Duyệt tuyến</button>
        <select [(ngModel)]="selectedDriver" name="dr" style="width:auto">
          <option value="">-- Chọn tài xế --</option>
          <option *ngFor="let d of drivers" [value]="d.id">{{ d.full_name }}</option>
        </select>
        <button (click)="assign()" [disabled]="plan.status !== 'Approved' || !selectedDriver">Phân tài xế</button>
        <input [(ngModel)]="cancelReason" name="cr" placeholder="Lý do hủy" style="width:auto;flex:1" />
        <button class="danger" (click)="cancel()" [disabled]="!cancelReason">Hủy tuyến</button>
      </div>
      <div class="error" *ngIf="error">{{ error }}</div>
      <p class="muted" style="margin-top:8px">{{ msg }}</p>
    </div>

    <div class="card" *ngIf="plan">
      <h2>Lộ trình ({{ plan.stops?.length }} điểm)</h2>
      <table>
        <thead><tr><th>#</th><th>Loại</th><th>Điểm</th><th>Giờ dự kiến</th><th>Trạng thái</th></tr></thead>
        <tbody>
          <tr *ngFor="let s of plan.stops">
            <td>{{ s.stop_sequence }}</td>
            <td>{{ s.point_type }}</td>
            <td>{{ s.location_name }}</td>
            <td>{{ s.planned_arrival_time | date: 'HH:mm' }}</td>
            <td>{{ s.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class RouteDetailComponent implements OnInit {
  plan?: RoutePlan;
  drivers: Driver[] = [];
  selectedDriver = '';
  cancelReason = '';
  error = '';
  msg = '';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
    this.api.listDrivers().subscribe((d) => (this.drivers = d));
  }

  load(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getRoute(id).subscribe((p) => (this.plan = p));
  }

  approve(): void {
    this.run(this.api.approveRoute(this.plan!.id), 'Đã duyệt tuyến.');
  }

  assign(): void {
    this.run(
      this.api.assignRoute(this.plan!.id, this.selectedDriver),
      'Đã phân tài xế.',
    );
  }

  cancel(): void {
    this.run(this.api.cancelRoute(this.plan!.id, this.cancelReason), 'Đã hủy tuyến.');
  }

  private run(obs: import('rxjs').Observable<unknown>, ok: string): void {
    this.error = '';
    obs.subscribe({
      next: () => {
        this.msg = ok;
        this.load();
      },
      error: (e) => (this.error = e?.error?.message ?? 'Thao tác thất bại'),
    });
  }

  back(): void {
    this.router.navigate(['/routes']);
  }
}
