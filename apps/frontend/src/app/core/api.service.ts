import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Dashboard,
  DispatchRequest,
  Driver,
  OptimizeResult,
  RoutePlan,
  Vehicle,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  // Requests
  listRequests(): Observable<DispatchRequest[]> {
    return this.http.get<DispatchRequest[]>(`${this.base}/dispatch-requests`);
  }
  getRequest(id: string): Observable<DispatchRequest> {
    return this.http.get<DispatchRequest>(`${this.base}/dispatch-requests/${id}`);
  }
  createRequest(body: unknown): Observable<DispatchRequest> {
    return this.http.post<DispatchRequest>(`${this.base}/dispatch-requests`, body);
  }
  submitRequest(id: string): Observable<DispatchRequest> {
    return this.http.post<DispatchRequest>(
      `${this.base}/dispatch-requests/${id}/submit`,
      {},
    );
  }
  cancelRequest(id: string, reason?: string): Observable<DispatchRequest> {
    return this.http.post<DispatchRequest>(
      `${this.base}/dispatch-requests/${id}/cancel`,
      { reason },
    );
  }

  // Routing
  classify(): Observable<Record<string, DispatchRequest[]>> {
    return this.http.post<Record<string, DispatchRequest[]>>(
      `${this.base}/routing/classify-requests`,
      {},
    );
  }
  preview(): Observable<OptimizeResult> {
    return this.http.post<OptimizeResult>(`${this.base}/routing/preview`, {});
  }
  optimize(): Observable<OptimizeResult> {
    return this.http.post<OptimizeResult>(`${this.base}/routing/optimize`, {});
  }

  // Route plans
  listRoutes(): Observable<RoutePlan[]> {
    return this.http.get<RoutePlan[]>(`${this.base}/routes`);
  }
  getRoute(id: string): Observable<RoutePlan> {
    return this.http.get<RoutePlan>(`${this.base}/routes/${id}`);
  }
  approveRoute(id: string): Observable<RoutePlan> {
    return this.http.post<RoutePlan>(`${this.base}/routes/${id}/approve`, {});
  }
  assignRoute(id: string, driver_id: string, vehicle_id?: string): Observable<RoutePlan> {
    return this.http.post<RoutePlan>(`${this.base}/routes/${id}/assign`, {
      driver_id,
      vehicle_id,
    });
  }
  cancelRoute(id: string, reason: string): Observable<RoutePlan> {
    return this.http.post<RoutePlan>(`${this.base}/routes/${id}/cancel`, { reason });
  }

  // Driver
  driverToday(): Observable<RoutePlan[]> {
    return this.http.get<RoutePlan[]>(`${this.base}/driver/routes/today`);
  }
  startRoute(id: string): Observable<RoutePlan> {
    return this.http.post<RoutePlan>(`${this.base}/routes/${id}/start`, {});
  }
  stopArrived(stopId: string): Observable<unknown> {
    return this.http.post(`${this.base}/driver/stops/${stopId}/arrived`, {});
  }
  stopPickup(stopId: string): Observable<unknown> {
    return this.http.post(`${this.base}/driver/stops/${stopId}/pickup-completed`, {});
  }
  stopDelivery(stopId: string): Observable<unknown> {
    return this.http.post(`${this.base}/driver/stops/${stopId}/delivery-completed`, {});
  }
  stopFailed(stopId: string, reason: string): Observable<unknown> {
    return this.http.post(`${this.base}/driver/stops/${stopId}/failed`, { reason });
  }

  // Master data
  listVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.base}/vehicles?active=true`);
  }
  listDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>(`${this.base}/drivers?active=true`);
  }

  // Reports
  dashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.base}/reports/dashboard`);
  }
}
