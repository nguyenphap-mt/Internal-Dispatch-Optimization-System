import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1>Tạo yêu cầu điều phối</h1>
    <div class="card">
      <div class="grid cols-2">
        <div>
          <label>Loại yêu cầu</label>
          <select [(ngModel)]="form.request_type" name="rt">
            <option value="Delivery">Giao hàng</option>
            <option value="Pickup">Lấy hàng</option>
            <option value="PickupDelivery">Lấy & giao</option>
            <option value="Internal">Nội bộ</option>
          </select>
        </div>
        <div>
          <label>Ưu tiên</label>
          <select [(ngModel)]="form.priority" name="pr">
            <option value="Urgent">Khẩn cấp</option>
            <option value="SameDay">Trong ngày</option>
            <option value="Flexible">Linh hoạt</option>
          </select>
        </div>
        <div>
          <label>Khối lượng (kg)</label>
          <input type="number" [(ngModel)]="form.weight_kg" name="w" />
        </div>
        <div>
          <label>Thể tích (m³)</label>
          <input type="number" [(ngModel)]="form.volume_m3" name="v" />
        </div>
        <div>
          <label>Khu vực / Quận (gom chuyến)</label>
          <input [(ngModel)]="form.area" name="area" placeholder="Hoàn Kiếm" />
        </div>
        <div>
          <label>Loại hàng</label>
          <input [(ngModel)]="form.cargo_type" name="ct" />
        </div>
        <div class="row" style="margin-top:24px">
          <label style="margin:0"><input type="checkbox" style="width:auto" [(ngModel)]="form.inner_city" name="ic" /> Nội thành</label>
          <label style="margin:0"><input type="checkbox" style="width:auto" [(ngModel)]="form.is_bulky" name="bk" /> Cồng kềnh</label>
          <label style="margin:0"><input type="checkbox" style="width:auto" [(ngModel)]="form.is_vip" name="vip" /> VIP</label>
        </div>
      </div>

      <h2 style="margin-top:20px">Điểm lấy hàng</h2>
      <div class="grid cols-2">
        <div><label>Tên điểm</label><input [(ngModel)]="pickup.location_name" name="pln" /></div>
        <div><label>SĐT liên hệ</label><input [(ngModel)]="pickup.contact_phone" name="pcp" /></div>
        <div><label>Vĩ độ (lat)</label><input type="number" [(ngModel)]="pickup.lat" name="plat" /></div>
        <div><label>Kinh độ (lng)</label><input type="number" [(ngModel)]="pickup.lng" name="plng" /></div>
        <div><label>Từ giờ</label><input type="datetime-local" [(ngModel)]="pickup.tw_start" name="pts" /></div>
        <div><label>Đến giờ</label><input type="datetime-local" [(ngModel)]="pickup.tw_end" name="pte" /></div>
      </div>

      <h2 style="margin-top:20px">Điểm giao hàng</h2>
      <div class="grid cols-2">
        <div><label>Tên điểm</label><input [(ngModel)]="delivery.location_name" name="dln" /></div>
        <div><label>SĐT liên hệ</label><input [(ngModel)]="delivery.contact_phone" name="dcp" /></div>
        <div><label>Vĩ độ (lat)</label><input type="number" [(ngModel)]="delivery.lat" name="dlat" /></div>
        <div><label>Kinh độ (lng)</label><input type="number" [(ngModel)]="delivery.lng" name="dlng" /></div>
        <div><label>Từ giờ</label><input type="datetime-local" [(ngModel)]="delivery.tw_start" name="dts" /></div>
        <div><label>Đến giờ (hạn giao)</label><input type="datetime-local" [(ngModel)]="delivery.tw_end" name="dte" /></div>
      </div>

      <div class="row" style="margin-top:18px">
        <button (click)="save(false)" [disabled]="busy">Lưu nháp</button>
        <button (click)="save(true)" [disabled]="busy">Lưu & gửi điều phối</button>
        <button class="secondary" (click)="back()">Hủy</button>
      </div>
      <div class="error" *ngIf="error">{{ error }}</div>
    </div>
  `,
})
export class RequestFormComponent {
  form = {
    request_type: 'Delivery',
    priority: 'SameDay',
    weight_kg: 10,
    volume_m3: 0.1,
    area: 'Hoàn Kiếm',
    cargo_type: 'Hàng tiêu dùng',
    inner_city: true,
    is_bulky: false,
    is_vip: false,
  };
  pickup = this.blankPoint('Kho trung tâm', 21.0278, 105.8342, 1);
  delivery = this.blankPoint('Khách hàng', 21.0285, 105.8542, 4);
  busy = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  private blankPoint(name: string, lat: number, lng: number, hoursEnd: number) {
    const start = new Date(Date.now() + 30 * 60000);
    const end = new Date(Date.now() + hoursEnd * 3600000);
    return {
      location_name: name,
      contact_phone: '0900000000',
      lat,
      lng,
      tw_start: this.toLocal(start),
      tw_end: this.toLocal(end),
    };
  }

  private toLocal(d: Date): string {
    const off = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - off).toISOString().slice(0, 16);
  }

  save(submit: boolean): void {
    this.busy = true;
    this.error = '';
    const body = {
      ...this.form,
      points: [
        {
          point_type: 'Pickup',
          location_name: this.pickup.location_name,
          contact_phone: this.pickup.contact_phone,
          lat: Number(this.pickup.lat),
          lng: Number(this.pickup.lng),
          time_window_start: new Date(this.pickup.tw_start).toISOString(),
          time_window_end: new Date(this.pickup.tw_end).toISOString(),
        },
        {
          point_type: 'Delivery',
          location_name: this.delivery.location_name,
          contact_phone: this.delivery.contact_phone,
          lat: Number(this.delivery.lat),
          lng: Number(this.delivery.lng),
          time_window_start: new Date(this.delivery.tw_start).toISOString(),
          time_window_end: new Date(this.delivery.tw_end).toISOString(),
        },
      ],
    };
    this.api.createRequest(body).subscribe({
      next: (r) => {
        if (submit) {
          this.api.submitRequest(r.id).subscribe({
            next: () => this.router.navigate(['/requests']),
            error: (e) => this.fail(e),
          });
        } else {
          this.router.navigate(['/requests']);
        }
      },
      error: (e) => this.fail(e),
    });
  }

  back(): void {
    this.router.navigate(['/requests']);
  }

  private fail(e: { error?: { message?: string | string[] } }): void {
    const msg = e?.error?.message;
    this.error = Array.isArray(msg) ? msg.join(', ') : msg ?? 'Lưu thất bại';
    this.busy = false;
  }
}
