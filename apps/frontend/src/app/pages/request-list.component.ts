import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { DispatchRequest } from '../core/models';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="row" style="justify-content:space-between">
      <h1>Yêu cầu điều phối</h1>
      <a routerLink="/requests/new"><button>+ Tạo yêu cầu</button></a>
    </div>

    <div class="card">
      <div class="row" style="gap:8px;margin-bottom:12px">
        <select [(ngModel)]="statusFilter" (change)="apply()" name="sf">
          <option value="">Tất cả trạng thái</option>
          <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
        </select>
      </div>
      <table>
        <thead>
          <tr><th>Mã</th><th>Loại</th><th>Ưu tiên</th><th>Khu vực</th><th>KL (kg)</th><th>Điểm</th><th>Phân loại</th><th>Trạng thái</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of filtered">
            <td>{{ r.request_code }}</td>
            <td>{{ r.request_type }}</td>
            <td>{{ r.priority }}</td>
            <td>{{ r.area || '-' }}</td>
            <td>{{ r.weight_kg }}</td>
            <td>{{ r.score }}</td>
            <td><span class="badge {{ r.classification }}">{{ r.classification || '-' }}</span></td>
            <td>{{ r.status }}</td>
            <td>
              <button class="secondary" *ngIf="r.status === 'Draft'" (click)="submit(r)">Gửi</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="muted" *ngIf="!filtered.length">Không có yêu cầu.</p>
    </div>
  `,
})
export class RequestListComponent implements OnInit {
  all: DispatchRequest[] = [];
  filtered: DispatchRequest[] = [];
  statusFilter = '';
  statuses = [
    'Draft', 'Submitted', 'WaitingDispatch', 'Planned', 'Assigned',
    'InProgress', 'Completed', 'Cancelled',
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.listRequests().subscribe((r) => {
      this.all = r;
      this.apply();
    });
  }

  apply(): void {
    this.filtered = this.statusFilter
      ? this.all.filter((r) => r.status === this.statusFilter)
      : this.all;
  }

  submit(r: DispatchRequest): void {
    this.api.submitRequest(r.id).subscribe(() => this.load());
  }
}
