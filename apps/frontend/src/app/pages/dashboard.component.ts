import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { DispatchRequest, OptimizeResult } from '../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Tổng quan điều phối</h1>

    <div class="card">
      <div class="row" style="justify-content:space-between">
        <h2 style="margin:0">Bộ não điều phối (decision-first)</h2>
        <div class="row">
          <button class="secondary" (click)="classify()" [disabled]="busy">Phân loại</button>
          <button (click)="optimize()" [disabled]="busy">
            {{ busy ? 'Đang tính...' : 'Tối ưu & tạo tuyến' }}
          </button>
        </div>
      </div>
      <p class="muted">
        Hệ thống chấm điểm, phân loại đơn (đi ngay / chuyến gần / gom / chờ), chọn xe,
        gom theo khu vực + khung giờ, tối ưu lộ trình và tính chi phí theo PRD §10.
      </p>
      <div class="error" *ngIf="error">{{ error }}</div>
    </div>

    <div class="grid cols-4" *ngIf="counts">
      <div class="card metric"><div class="value" style="color:var(--red)">{{ counts.urgent }}</div><div class="label">Đi ngay (≥80)</div></div>
      <div class="card metric"><div class="value" style="color:var(--orange)">{{ counts.nextTrip }}</div><div class="label">Chuyến gần (50-79)</div></div>
      <div class="card metric"><div class="value" style="color:var(--primary)">{{ counts.groupable }}</div><div class="label">Có thể gom (20-49)</div></div>
      <div class="card metric"><div class="value muted">{{ counts.waiting }}</div><div class="label">Chờ (&lt;20)</div></div>
    </div>

    <div class="card" *ngIf="result">
      <h2>Kết quả tối ưu</h2>
      <p>{{ result.explanation }}</p>
      <div class="grid cols-4">
        <div class="metric"><div class="value">{{ result.suggestedRoutes.length }}</div><div class="label">Tuyến đề xuất</div></div>
        <div class="metric"><div class="value">{{ result.totalDistanceKm }} km</div><div class="label">Tổng quãng đường</div></div>
        <div class="metric"><div class="value">{{ result.totalCost | number }}</div><div class="label">Tổng chi phí (đ)</div></div>
        <div class="metric"><div class="value">{{ result.totalDurationMinutes }}'</div><div class="label">Tổng thời gian</div></div>
      </div>
      <div class="error" *ngIf="result.warnings?.length">
        <strong>Cảnh báo:</strong>
        <ul><li *ngFor="let w of result.warnings">{{ w }}</li></ul>
      </div>
    </div>

    <div class="card" *ngIf="result">
      <h2>Tuyến đã tạo</h2>
      <table>
        <thead><tr><th>Mã tuyến</th><th>Xe</th><th>Số đơn</th><th>Km</th><th>Chi phí</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let r of routes">
            <td>{{ r.route_code }}</td>
            <td>{{ r.vehicle?.vehicle_code }} ({{ r.vehicle?.vehicle_type }})</td>
            <td>{{ r.stops?.length }}</td>
            <td>{{ r.estimated_distance_km }}</td>
            <td>{{ r.estimated_cost | number }}</td>
            <td><button class="secondary" (click)="open(r.id)">Xem</button></td>
          </tr>
        </tbody>
      </table>
      <p class="muted" *ngIf="!routes.length">Chưa có tuyến — bấm "Tối ưu & tạo tuyến".</p>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  counts?: { urgent: number; nextTrip: number; groupable: number; waiting: number };
  result?: OptimizeResult;
  routes: import('../core/models').RoutePlan[] = [];
  busy = false;
  error = '';

  constructor(
    private api: ApiService,
    private router: Router,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.classify();
    this.api.listRoutes().subscribe((r) => (this.routes = r));
  }

  classify(): void {
    this.busy = true;
    this.error = '';
    this.api.classify().subscribe({
      next: (d: Record<string, DispatchRequest[]>) => {
        this.counts = {
          urgent: d['urgent']?.length ?? 0,
          nextTrip: d['nextTrip']?.length ?? 0,
          groupable: d['groupable']?.length ?? 0,
          waiting: d['waiting']?.length ?? 0,
        };
        this.busy = false;
      },
      error: (e) => this.fail(e),
    });
  }

  optimize(): void {
    this.busy = true;
    this.error = '';
    this.api.optimize().subscribe({
      next: (res) => {
        this.result = res;
        this.busy = false;
        this.api.listRoutes().subscribe((r) => (this.routes = r));
      },
      error: (e) => this.fail(e),
    });
  }

  open(id: string): void {
    this.router.navigate(['/routes', id]);
  }

  private fail(e: { error?: { message?: string } }): void {
    this.error = e?.error?.message ?? 'Có lỗi xảy ra';
    this.busy = false;
  }
}
