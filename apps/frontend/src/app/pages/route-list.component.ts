import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { RoutePlan } from '../core/models';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Tuyến điều phối</h1>
    <div class="card">
      <table>
        <thead>
          <tr><th>Mã tuyến</th><th>Xe</th><th>Tài xế</th><th>Trạng thái</th><th>Km</th><th>Chi phí</th><th></th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of routes">
            <td>{{ r.route_code }}</td>
            <td>{{ r.vehicle?.vehicle_code }}</td>
            <td>{{ r.driver?.full_name || '-' }}</td>
            <td>{{ r.status }}</td>
            <td>{{ r.estimated_distance_km }}</td>
            <td>{{ r.estimated_cost | number }}</td>
            <td><button class="secondary" (click)="open(r.id)">Chi tiết</button></td>
          </tr>
        </tbody>
      </table>
      <p class="muted" *ngIf="!routes.length">Chưa có tuyến nào. Hãy chạy tối ưu ở Tổng quan.</p>
    </div>
  `,
})
export class RouteListComponent implements OnInit {
  routes: RoutePlan[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.listRoutes().subscribe((r) => (this.routes = r));
  }

  open(id: string): void {
    this.router.navigate(['/routes', id]);
  }
}
