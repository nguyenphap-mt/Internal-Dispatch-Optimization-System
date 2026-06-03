import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Dashboard } from '../core/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Báo cáo ngày {{ data?.date }}</h1>
    <div class="grid cols-4" *ngIf="data">
      <div class="card metric"><div class="value">{{ data.requests.total }}</div><div class="label">Tổng yêu cầu</div></div>
      <div class="card metric"><div class="value">{{ data.routes.total }}</div><div class="label">Số tuyến</div></div>
      <div class="card metric"><div class="value">{{ data.routes.total_distance_km }} km</div><div class="label">Tổng quãng đường</div></div>
      <div class="card metric"><div class="value">{{ data.routes.total_cost | number }}</div><div class="label">Tổng chi phí (đ)</div></div>
    </div>

    <div class="grid cols-2" *ngIf="data">
      <div class="card">
        <h2>Tỉ lệ đúng giờ</h2>
        <div class="metric"><div class="value" style="color:var(--green)">{{ (data.on_time.rate * 100) | number: '1.0-1' }}%</div>
          <div class="label">{{ data.on_time.on_time_stops }}/{{ data.on_time.completed_stops }} điểm đúng giờ</div></div>
      </div>
      <div class="card">
        <h2>Yêu cầu theo trạng thái</h2>
        <table>
          <tr *ngFor="let kv of statusEntries"><td>{{ kv[0] }}</td><td style="text-align:right">{{ kv[1] }}</td></tr>
        </table>
      </div>
    </div>

    <div class="card" *ngIf="data">
      <h2>Phân loại đơn (bộ não)</h2>
      <table>
        <tr *ngFor="let kv of classEntries">
          <td><span class="badge {{ kv[0] }}">{{ kv[0] }}</span></td>
          <td style="text-align:right">{{ kv[1] }}</td>
        </tr>
      </table>
    </div>
    <div class="error" *ngIf="error">{{ error }}</div>
  `,
})
export class ReportsComponent implements OnInit {
  data?: Dashboard;
  statusEntries: [string, number][] = [];
  classEntries: [string, number][] = [];
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.dashboard().subscribe({
      next: (d) => {
        this.data = d;
        this.statusEntries = Object.entries(d.requests.by_status);
        this.classEntries = Object.entries(d.requests.by_classification);
      },
      error: (e) => (this.error = e?.error?.message ?? 'Không tải được báo cáo'),
    });
  }
}
