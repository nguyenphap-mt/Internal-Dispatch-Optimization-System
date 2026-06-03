import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <ng-container *ngIf="auth.isLoggedIn; else bare">
      <header class="topbar">
        <div class="brand">🚚 Dispatch Optimizer</div>
        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">Tổng quan</a>
          <a routerLink="/requests" routerLinkActive="active">Yêu cầu</a>
          <a routerLink="/requests/new" routerLinkActive="active">Tạo yêu cầu</a>
          <a routerLink="/routes" routerLinkActive="active">Tuyến</a>
          <a routerLink="/driver" routerLinkActive="active">Tài xế</a>
          <a routerLink="/reports" routerLinkActive="active">Báo cáo</a>
        </nav>
        <div class="user">
          <span>{{ auth.user()?.full_name }} ({{ auth.user()?.role_code }})</span>
          <button (click)="logout()">Đăng xuất</button>
        </div>
      </header>
      <main class="content"><router-outlet></router-outlet></main>
    </ng-container>
    <ng-template #bare><router-outlet></router-outlet></ng-template>
  `,
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
