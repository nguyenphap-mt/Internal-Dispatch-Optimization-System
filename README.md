# Internal Dispatch Optimization System

Hệ thống tối ưu điều phối nội bộ theo mô hình **decision-first**: một "bộ não"
điều phối tự động **chấm điểm** đơn hàng, **phân loại** mức độ ưu tiên, **chọn xe**
phù hợp, **gom đơn** theo khu vực + khung giờ, **tối ưu lộ trình** và **tính chi phí**
— theo đúng PRD (`docs/`).

> Stack: **NestJS + TypeORM + PostgreSQL** (backend) · **Angular 17** (frontend) ·
> **Haversine + heuristic (nearest-neighbor + 2-opt)** cho routing (không bắt buộc
> OSRM/OR-Tools), có thể cắm OSRM tự host qua biến môi trường `OSRM_URL`.

---

## Kiến trúc

```
apps/
  backend/    NestJS API + Routing Engine ("bộ não" decision-first)
  frontend/   Angular 17 SPA (đăng nhập, điều phối, tài xế, báo cáo)
docs/         Tài liệu PRD & thiết kế
docker-compose.yml   postgres + backend + frontend
```

Vòng đời yêu cầu: `Draft → Submitted → WaitingDispatch → Planned → Assigned →
InProgress → PickupCompleted → DeliveryCompleted → Completed` (hoặc `Cancelled/Failed`).

Bộ não điều phối (PRD §10):
1. **Scoring** — chấm điểm 9 tiêu chí (ưu tiên, hạn giao, VIP, khoảng cách...).
2. **Classification** — `Urgent ≥80` / `NextTrip 50–79` / `Groupable 20–49` / `Waiting <20`.
3. **Vehicle match** — luật BR-VEH (tải trọng, thể tích, khu vực, hàng cồng kềnh).
4. **Clustering** — gom theo khu vực/quận + khung giờ giao (BR-GRP).
5. **Route optimization** — nearest-neighbor + 2-opt trên ma trận khoảng cách.
6. **Cost** — chi phí cố định + nhiên liệu theo km (PRD §10.6).

---

## Chạy nhanh bằng Docker (khuyến nghị)

```bash
docker compose up --build
```

- Frontend: <http://localhost:4200>
- Backend API: <http://localhost:3000/api>
- Swagger: <http://localhost:3000/api/docs>

Backend tự **seed** dữ liệu mẫu khi khởi động (idempotent): 6 vai trò, 6 người dùng,
3 xe, 1 tài xế và một số yêu cầu mẫu.

### Tài khoản mẫu (mật khẩu: `password123`)

| Vai trò      | Email                       |
|--------------|-----------------------------|
| Admin        | admin@dispatch.local        |
| Sales        | sales@dispatch.local        |
| Purchasing   | purchasing@dispatch.local   |
| Dispatcher   | dispatcher@dispatch.local   |
| Manager      | manager@dispatch.local      |
| Driver       | driver@dispatch.local       |

---

## Chạy thủ công (dev)

Yêu cầu: Node.js 22+, PostgreSQL 16 (hoặc dùng container postgres ở trên).

### 1. PostgreSQL

```bash
docker run --name dispatch-pg -e POSTGRES_USER=dispatch \
  -e POSTGRES_PASSWORD=dispatch -e POSTGRES_DB=dispatch \
  -p 5432:5432 -d postgres:16-alpine
```

### 2. Backend

```bash
cd apps/backend
cp .env.example .env          # chỉnh nếu cần
npm install
npm run seed                  # tạo dữ liệu mẫu
npm run start:dev             # http://localhost:3000/api
```

### 3. Frontend

```bash
cd apps/frontend
npm install
npm start                     # http://localhost:4200 (proxy /api -> :3000)
```

---

## Kiểm thử & chất lượng mã

```bash
# Backend
cd apps/backend
npm run lint
npm run build
npm test            # unit test cho routing engine (bao gồm test case PRD §19.3)

# Frontend
cd apps/frontend
npm run build
```

---

## Cấu hình backend (biến môi trường)

| Biến             | Mặc định               | Ghi chú                                  |
|------------------|------------------------|------------------------------------------|
| `PORT`           | `3000`                 | Cổng API                                 |
| `DB_HOST`        | `localhost`            | Host PostgreSQL                          |
| `DB_PORT`        | `5432`                 |                                          |
| `DB_USER`        | `dispatch`             |                                          |
| `DB_PASSWORD`    | `dispatch`             |                                          |
| `DB_NAME`        | `dispatch`             |                                          |
| `DB_SYNCHRONIZE` | `true`                 | Tự đồng bộ schema (dev)                  |
| `JWT_SECRET`     | `dispatch-dev-secret`  | Khóa ký JWT                              |
| `CORS_ORIGIN`    | `*`                    | Origin frontend                          |
| `OSRM_URL`       | *(trống)*              | URL OSRM tự host; trống = Haversine      |

---

## API chính

| Nhóm        | Endpoint (prefix `/api`)                                |
|-------------|---------------------------------------------------------|
| Auth        | `POST /auth/login`                                      |
| Yêu cầu     | `GET/POST /dispatch-requests`, `/:id/submit`, `/:id/cancel` |
| Bộ não      | `POST /routing/classify-requests`, `/routing/preview`, `/routing/optimize` |
| Tuyến       | `GET /routes`, `/:id/approve`, `/:id/assign`, `/:id/start`, `/:id/cancel` |
| Tài xế      | `GET /driver/routes/today`, `POST /driver/stops/:id/{arrived,pickup-completed,delivery-completed,failed}` |
| Báo cáo     | `GET /reports/dashboard`                                |

Xem chi tiết tại Swagger UI: <http://localhost:3000/api/docs>.
