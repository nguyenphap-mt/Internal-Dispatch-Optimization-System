import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrap">
      <div class="card login-card">
        <h1>🚚 Dispatch Optimizer</h1>
        <p class="muted">Hệ thống tối ưu điều phối nội bộ</p>
        <label>Email</label>
        <input [(ngModel)]="email" placeholder="dispatcher@dispatch.local" />
        <label>Mật khẩu</label>
        <input type="password" [(ngModel)]="password" (keyup.enter)="submit()" />
        <div style="margin-top:14px">
          <button (click)="submit()" [disabled]="loading">
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </div>
        <div class="error" *ngIf="error">{{ error }}</div>
        <p class="muted" style="margin-top:16px;font-size:12px">
          Tài khoản mẫu (mật khẩu: <code>password123</code>):<br />
          dispatcher / admin / sales / driver / manager &#64; dispatch.local
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = 'dispatcher@dispatch.local';
  password = 'password123';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err?.error?.message ?? 'Đăng nhập thất bại';
        this.loading = false;
      },
    });
  }
}
