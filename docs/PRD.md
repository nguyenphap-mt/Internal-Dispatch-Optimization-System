# INTERNAL DISPATCH OPTIMIZATION SYSTEM
# Tài liệu đặc tả tổng hợp để AI Agent xây dựng phần mềm

Phiên bản: v1.0  
Ngôn ngữ tài liệu: Tiếng Việt  
Mục tiêu sử dụng: Cung cấp cho AI Agent / Coding Agent để thiết kế và xây dựng phần mềm logistics nội bộ.  

---

# 1. Tóm tắt dự án

## 1.1 Tên hệ thống

**Internal Dispatch Optimization System**  
Tên tiếng Việt: **Hệ thống điều phối và tối ưu giao nhận nội bộ**

## 1.2 Bản chất sản phẩm

Đây là phần mềm độc lập, tách riêng khỏi ERP.

Phần mềm này không phải:

- ERP
- CRM
- WMS
- Phần mềm kế toán
- Phần mềm bán hàng
- Phần mềm quản lý kho đầy đủ

Phần mềm này tập trung vào:

- Tạo yêu cầu giao nhận nội bộ
- Gom đơn giao nhận
- Phân xe
- Phân tài xế
- Tối ưu tuyến đường
- Tối ưu thời điểm xuất phát
- Giảm chi phí vận hành giao nhận
- Theo dõi trạng thái thực hiện

---

# 2. Bối cảnh doanh nghiệp

## 2.1 Hiện trạng

Công ty hiện có bộ phận giao nhận nội bộ.

Nguồn tạo yêu cầu giao nhận:

- Nhân viên kinh doanh
- Nhân viên thu mua

Phương tiện hiện tại:

- 1 xe máy
- 1 xe tải

Khả năng mở rộng:

- Có thể thêm nhiều xe máy
- Có thể thêm nhiều xe tải
- Có thể thêm nhiều tài xế

Khối lượng công việc:

- Khoảng 20–30 yêu cầu giao nhận mỗi ngày

Phạm vi hoạt động:

- Xe máy: chủ yếu nội thành
- Xe tải: nội thành và ngoại thành

Hiện trạng quản lý:

- Chưa có phần mềm
- Chưa có file Excel chuẩn
- Điều phối còn phụ thuộc kinh nghiệm cá nhân
- Chưa có dữ liệu để đo chi phí, số km, hiệu quả tuyến

## 2.2 Vấn đề chính

Các vấn đề hiện tại:

1. Không xác định được lộ trình tối ưu.
2. Xe có thể chạy lòng vòng, trùng tuyến.
3. Không biết đơn nào phải đi ngay, đơn nào có thể chờ gom chuyến.
4. Không có cơ chế tự động phân xe máy hay xe tải.
5. Không có dữ liệu để tính chi phí vận chuyển.
6. Không có dashboard điều phối tập trung.
7. Không có lịch sử tuyến để cải tiến vận hành.
8. Không có báo cáo hiệu quả xe và tài xế.

---

# 3. Mục tiêu sản phẩm

## 3.1 Mục tiêu lớn nhất

Mục tiêu lớn nhất là:

**Tối ưu tuyến đường và chi phí giao nhận.**

Hệ thống phải giúp công ty giảm:

- Tổng số km chạy xe
- Số chuyến không cần thiết
- Chi phí nhiên liệu
- Thời gian giao nhận
- Thời gian xe chạy rỗng
- Chi phí nhân công giao nhận
- Rủi ro giao trễ

## 3.2 Mục tiêu vận hành

Hệ thống phải tự động hỗ trợ trả lời các câu hỏi:

1. Đơn nào cần xử lý ngay?
2. Đơn nào có thể chờ gom chuyến?
3. Đơn nào nên đi bằng xe máy?
4. Đơn nào nên đi bằng xe tải?
5. Các đơn nào có thể gom chung?
6. Xe nên xuất phát lúc mấy giờ?
7. Thứ tự điểm dừng nào tối ưu nhất?
8. Tuyến nào có chi phí thấp nhất nhưng vẫn đảm bảo đúng hẹn?

## 3.3 Mục tiêu chi phí phần mềm

Yêu cầu quan trọng:

**Không tốn chi phí phần mềm hàng tháng.**

Ưu tiên công nghệ:

- Open-source
- Self-host
- Docker Compose
- PostgreSQL
- OpenStreetMap
- OSRM
- OR-Tools

---

# 4. Phạm vi MVP

## 4.1 Có trong MVP

MVP phải có:

1. Đăng nhập và phân quyền.
2. Quản lý người dùng.
3. Quản lý xe.
4. Quản lý tài xế.
5. Tạo yêu cầu giao nhận.
6. Nhập thời gian cần lấy/giao hàng.
7. Chấm điểm độ gấp của đơn.
8. Phân loại đơn: đi ngay / chuyến gần nhất / có thể gom / chờ.
9. Đề xuất xe phù hợp.
10. Gom đơn theo khu vực và thời gian.
11. Tối ưu tuyến cơ bản.
12. Điều phối viên duyệt tuyến.
13. Tài xế xem tuyến được giao.
14. Tài xế cập nhật trạng thái từng điểm.
15. Báo cáo cơ bản.

## 4.2 Chưa cần trong MVP

Các chức năng có thể làm sau:

1. GPS realtime.
2. App mobile native.
3. AI dự đoán kẹt xe.
4. Tự động gửi SMS/Zalo cho khách.
5. Tích hợp ERP.
6. Tích hợp kế toán.
7. Tích hợp tồn kho.
8. Tối ưu nâng cao theo dữ liệu lịch sử.

---

# 5. Vai trò người dùng

## 5.1 Sales

Nhân viên kinh doanh.

Được phép:

- Tạo yêu cầu giao hàng.
- Xem yêu cầu do mình tạo.
- Hủy yêu cầu khi chưa được điều phối.
- Theo dõi trạng thái yêu cầu của mình.

Không được phép:

- Phân xe.
- Phân tài xế.
- Tối ưu tuyến.
- Sửa yêu cầu sau khi đã được điều phối nếu chưa có quyền.

## 5.2 Purchasing

Nhân viên thu mua.

Được phép:

- Tạo yêu cầu lấy hàng.
- Xem yêu cầu do mình tạo.
- Theo dõi trạng thái lấy hàng.

Không được phép:

- Phân xe.
- Phân tài xế.
- Duyệt tuyến.

## 5.3 Dispatcher

Điều phối viên.

Được phép:

- Xem toàn bộ yêu cầu giao nhận.
- Kiểm tra đơn chờ xử lý.
- Chạy tối ưu tuyến.
- Duyệt tuyến đề xuất.
- Điều chỉnh tuyến thủ công.
- Phân xe.
- Phân tài xế.
- Hủy tuyến.
- Xem cảnh báo.
- Ghi đè đề xuất hệ thống kèm lý do.

## 5.4 Driver

Tài xế / nhân viên giao nhận.

Được phép:

- Xem tuyến được giao.
- Xem thứ tự điểm dừng.
- Xem thông tin liên hệ.
- Bấm bắt đầu tuyến.
- Bấm đã đến điểm lấy.
- Bấm đã lấy hàng.
- Bấm đã đến điểm giao.
- Bấm đã giao hàng.
- Báo thất bại.
- Ghi chú thực tế.

Không được phép:

- Tự đổi thứ tự tuyến nếu chưa được cho phép.
- Xóa đơn.
- Phân lại xe.

## 5.5 Manager

Quản lý.

Được phép:

- Xem dashboard tổng hợp.
- Xem báo cáo chi phí.
- Xem hiệu suất xe.
- Xem hiệu suất tài xế.
- Xem tỷ lệ đúng hẹn.
- Xem lịch sử tuyến.

## 5.6 Admin

Quản trị hệ thống.

Được phép:

- Quản lý người dùng.
- Quản lý vai trò.
- Quản lý xe.
- Quản lý tài xế.
- Cấu hình tham số routing.
- Cấu hình khu vực.
- Cấu hình chi phí.

---

# 6. Loại yêu cầu giao nhận

## 6.1 Pickup

Lấy hàng từ nhà cung cấp, khách hàng hoặc địa điểm bên ngoài.

Ví dụ:

Nhà cung cấp → Kho công ty

## 6.2 Delivery

Giao hàng từ kho công ty đến khách hàng.

Ví dụ:

Kho công ty → Khách hàng

## 6.3 Pickup and Delivery

Lấy hàng tại điểm A và giao trực tiếp đến điểm B.

Ví dụ:

Nhà cung cấp → Công trình khách hàng

## 6.4 Internal Transfer

Chuyển hàng giữa các địa điểm nội bộ.

Ví dụ:

Kho A → Kho B

---

# 7. Dữ liệu bắt buộc khi tạo yêu cầu

## 7.1 Thông tin chung

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| request_code | Có | Tự sinh, ví dụ YC000001 |
| request_type | Có | Pickup, Delivery, PickupDelivery, Internal |
| priority | Có | Urgent, SameDay, Flexible |
| created_by | Có | Lấy từ user đăng nhập |
| department | Có | Sales hoặc Purchasing |
| requested_date | Có | Ngày yêu cầu |
| note | Không | Ghi chú thêm |

## 7.2 Thông tin hàng hóa

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| cargo_type | Có | Thiết bị điện, tủ điện, cáp, vật tư |
| weight_kg | Có | Dùng phân xe |
| length_cm | Không | Dài |
| width_cm | Không | Rộng |
| height_cm | Không | Cao |
| volume_m3 | Có thể tự tính | Dài x rộng x cao |
| is_bulky | Có | Hàng cồng kềnh |
| cargo_value | Không | Giá trị hàng |
| fragile | Không | Dễ vỡ |

## 7.3 Điểm lấy

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| pickup_location_name | Có nếu có lấy | Tên công ty/kho |
| pickup_address | Có nếu có lấy | Địa chỉ đầy đủ |
| pickup_lat | Có sau geocode | Tọa độ |
| pickup_lng | Có sau geocode | Tọa độ |
| pickup_contact_name | Có | Người liên hệ |
| pickup_contact_phone | Có | Số điện thoại |
| pickup_window_start | Có | Giờ bắt đầu có thể lấy |
| pickup_window_end | Có | Giờ cuối phải lấy |

## 7.4 Điểm giao

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| delivery_location_name | Có nếu có giao | Tên nơi giao |
| delivery_address | Có nếu có giao | Địa chỉ đầy đủ |
| delivery_lat | Có sau geocode | Tọa độ |
| delivery_lng | Có sau geocode | Tọa độ |
| delivery_contact_name | Có | Người nhận |
| delivery_contact_phone | Có | Số điện thoại |
| delivery_window_start | Có | Giờ bắt đầu có thể giao |
| delivery_window_end | Có | Deadline giao |

---

# 8. Trạng thái yêu cầu

```text
Draft
Submitted
WaitingDispatch
Planned
Assigned
InProgress
PickupCompleted
DeliveryCompleted
Completed
Cancelled
Failed
```

## 8.1 Ý nghĩa trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| Draft | Đơn nháp |
| Submitted | Người tạo đã gửi yêu cầu |
| WaitingDispatch | Đơn đang chờ điều phối |
| Planned | Đơn đã nằm trong tuyến nháp |
| Assigned | Đã phân xe/tài xế |
| InProgress | Tài xế đang thực hiện |
| PickupCompleted | Đã lấy hàng |
| DeliveryCompleted | Đã giao hàng |
| Completed | Hoàn tất toàn bộ |
| Cancelled | Đã hủy |
| Failed | Thất bại |

---

# 9. Business Rules

## 9.1 Rule dữ liệu

| Mã | Nội dung |
|---|---|
| BR-DATA-001 | Không cho submit nếu thiếu địa chỉ lấy/giao bắt buộc |
| BR-DATA-002 | Không cho submit nếu thiếu thời gian cần lấy/giao |
| BR-DATA-003 | Không cho submit nếu thiếu khối lượng |
| BR-DATA-004 | Nếu địa chỉ không geocode được, đơn chuyển vào nhóm cần kiểm tra |
| BR-DATA-005 | Số điện thoại người liên hệ là bắt buộc |
| BR-DATA-006 | Thời gian kết thúc phải lớn hơn thời gian bắt đầu |
| BR-DATA-007 | Không cho tạo đơn có deadline trong quá khứ |

## 9.2 Rule phân loại độ gấp

| Mã | Nội dung |
|---|---|
| BR-URG-001 | Nếu priority = Urgent thì cộng điểm gấp cao |
| BR-URG-002 | Nếu còn dưới 2 giờ đến deadline giao thì xếp nhóm cần xử lý ngay |
| BR-URG-003 | Nếu còn dưới 2 giờ đến deadline lấy thì xếp nhóm cần xử lý ngay |
| BR-URG-004 | Nếu deadline hôm nay thì tối thiểu xếp nhóm chuyến gần nhất |
| BR-URG-005 | Nếu Flexible và deadline còn xa thì đưa vào nhóm chờ gom |
| BR-URG-006 | Không được gom chuyến nếu làm trễ deadline |

## 9.3 Rule phân xe

| Mã | Nội dung |
|---|---|
| BR-VEH-001 | Xe máy ưu tiên đơn nội thành |
| BR-VEH-002 | Xe máy chỉ nhận hàng nhẹ theo cấu hình max_weight |
| BR-VEH-003 | Xe máy không nhận hàng cồng kềnh |
| BR-VEH-004 | Xe tải nhận hàng nặng |
| BR-VEH-005 | Xe tải nhận hàng cồng kềnh |
| BR-VEH-006 | Xe tải nhận đơn ngoại thành |
| BR-VEH-007 | Nếu cả xe máy và xe tải đều phù hợp, chọn xe có chi phí thấp hơn |
| BR-VEH-008 | Nếu đơn rất gấp, chọn xe khả dụng sớm nhất |
| BR-VEH-009 | Không được phân tuyến nếu vượt tải trọng |
| BR-VEH-010 | Không được phân tuyến nếu vượt thể tích |

## 9.4 Rule gom chuyến

| Mã | Nội dung |
|---|---|
| BR-GRP-001 | Chỉ gom các đơn có time window tương thích |
| BR-GRP-002 | Chỉ gom nếu không làm đơn nào trễ deadline |
| BR-GRP-003 | Ưu tiên gom các đơn cùng khu vực |
| BR-GRP-004 | Ưu tiên gom các đơn cùng hướng di chuyển |
| BR-GRP-005 | Đơn không khẩn cấp không nên đi riêng nếu có thể chờ |
| BR-GRP-006 | Tuyến chỉ có 1 đơn không khẩn cấp phải cảnh báo không hiệu quả |
| BR-GRP-007 | Đơn ngoại thành của xe tải nên gom thành chuyến lớn nếu có thể |
| BR-GRP-008 | Nếu chờ gom vượt quá thời gian chờ tối đa thì phải đưa vào chuyến gần nhất |

## 9.5 Rule điều phối

| Mã | Nội dung |
|---|---|
| BR-DIS-001 | Dispatcher có quyền duyệt tuyến đề xuất |
| BR-DIS-002 | Dispatcher có quyền chỉnh sửa tuyến |
| BR-DIS-003 | Mọi chỉnh sửa thủ công phải lưu lý do |
| BR-DIS-004 | Không cho tài xế bắt đầu tuyến nếu tuyến chưa Assigned |
| BR-DIS-005 | Khi tuyến đã InProgress, chỉnh sửa phải tạo log |
| BR-DIS-006 | Nếu có đơn mới gấp, hệ thống cho phép recalculate tuyến |

---

# 10. Routing Engine Specification

## 10.1 Mục tiêu Routing Engine

Routing Engine là bộ não của hệ thống.

Nó không chỉ tìm đường ngắn nhất.

Nó phải quyết định:

1. Đơn nào cần đi ngay.
2. Đơn nào có thể chờ.
3. Đơn nào có thể gom.
4. Xe nào phù hợp.
5. Thời điểm xuất phát tối ưu.
6. Thứ tự điểm dừng tối ưu.
7. Tuyến nào có chi phí thấp nhất nhưng không trễ hẹn.

## 10.2 Input

Routing Engine nhận:

- Danh sách yêu cầu giao nhận
- Danh sách xe
- Danh sách tài xế
- Tọa độ kho
- Thời gian hiện tại
- Cấu hình chi phí
- Cấu hình tải trọng
- Cấu hình khu vực
- Ma trận khoảng cách/thời gian từ OSRM

## 10.3 Output

Routing Engine trả về:

- Danh sách đơn cần xử lý ngay
- Danh sách đơn có thể gom
- Danh sách đơn chờ
- Danh sách đơn lỗi dữ liệu
- Tuyến đề xuất cho xe máy
- Tuyến đề xuất cho xe tải
- Thời điểm xuất phát
- Tổng km
- Tổng thời gian
- Tổng chi phí
- Cảnh báo
- Giải thích quyết định

## 10.4 Flow xử lý

```text
Validate Input
Normalize Data
Score Requests
Classify Requests
Match Vehicles
Cluster Requests
Build Candidate Routes
Optimize Stop Order
Calculate Cost
Select Best Route
Generate Explanation
Return Result
```

## 10.5 Công thức chấm điểm đơn

| Tiêu chí | Điều kiện | Điểm |
|---|---|---|
| Gần deadline giao | Còn dưới 2 giờ | +50 |
| Gần deadline lấy | Còn dưới 2 giờ | +40 |
| Ưu tiên khẩn cấp | priority = urgent | +40 |
| Deadline hôm nay | Có | +25 |
| Cùng khu vực với nhiều đơn khác | Có | +20 |
| Phù hợp xe máy | Có | +10 |
| Phù hợp xe tải | Có | +10 |
| Khách quan trọng | VIP | +15 |
| Linh hoạt | Có | -25 |
| Thiếu dữ liệu | Có | -100 |

Phân loại:

| Điểm | Nhóm |
|---|---|
| >= 80 | Cần đi ngay |
| 50–79 | Chuyến gần nhất |
| 20–49 | Có thể gom |
| 0–19 | Chờ |
| < 0 | Không hợp lệ |

## 10.6 Hàm chi phí

```text
total_cost =
(distance_km * fuel_cost_per_km)
+ (duration_minutes * driver_cost_per_minute)
+ (late_minutes * late_penalty_per_minute)
+ (empty_distance_km * empty_run_penalty)
+ vehicle_fixed_trip_cost
```

## 10.7 Thứ tự ưu tiên tối ưu

1. Không trễ hẹn.
2. Không vượt tải.
3. Chi phí thấp nhất.
4. Tổng km thấp nhất.
5. Tổng thời gian thấp nhất.
6. Ít chuyến nhất.
7. Ít xe nhất.

## 10.8 Route Score

```text
route_score =
deadline_score * 0.35
+ cost_score * 0.30
+ distance_score * 0.15
+ grouping_score * 0.10
+ vehicle_fit_score * 0.10
```

## 10.9 Pseudocode

```text
function optimizeDispatch(requests, vehicles, drivers, depot, currentTime):

    validRequests = validateRequests(requests)
    invalidRequests = collectInvalidRequests(requests)

    scoredRequests = scoreRequests(validRequests, currentTime)

    urgent = filter(scoredRequests, score >= 80)
    nextTrip = filter(scoredRequests, 50 <= score < 80)
    groupable = filter(scoredRequests, 20 <= score < 50)
    waiting = filter(scoredRequests, score < 20)

    candidateRequests = urgent + nextTrip

    if urgent is empty:
        candidateRequests += selectGroupableRequestsThatImproveCost(groupable)

    vehicleMatches = matchVehicles(candidateRequests, vehicles)

    clusters = clusterByAreaAndTime(candidateRequests)

    candidateRoutes = []

    for vehicle in vehicles:
        for cluster in clusters:
            if vehicleCanServe(vehicle, cluster):
                route = buildRoute(vehicle, cluster, depot)
                optimizedRoute = optimizeStopOrder(route)
                routeCost = calculateCost(optimizedRoute)
                candidateRoutes.append(optimizedRoute)

    bestRoutes = selectBestRoutes(candidateRoutes)

    return {
        urgentRequests: urgent,
        nextTripRequests: nextTrip,
        groupableRequests: groupable,
        waitingRequests: waiting,
        invalidRequests: invalidRequests,
        suggestedRoutes: bestRoutes,
        warnings: generateWarnings(bestRoutes),
        explanation: generateExplanation(bestRoutes)
    }
```

---

# 11. Delivery Wave

Hệ thống sử dụng khái niệm Delivery Wave để tránh việc có đơn nào là đi đơn đó.

## 11.1 Wave mặc định

| Wave | Thời gian | Mục đích |
|---|---|---|
| Wave 1 | 08:00–10:00 | Xử lý đơn gấp buổi sáng |
| Wave 2 | 10:00–12:00 | Gom đơn buổi sáng |
| Wave 3 | 13:30–15:30 | Gom đơn buổi chiều |
| Wave 4 | 15:30–17:30 | Xử lý đơn cuối ngày |

## 11.2 Nguyên tắc

- Wave không cố định cứng.
- Có đơn gấp thì được đi ngoài wave.
- Nếu chờ wave làm trễ deadline thì phải xuất phát ngay.
- Nếu đơn linh hoạt thì ưu tiên chờ wave để gom chuyến.

---

# 12. Database Design

## 12.1 Bảng users

| Field | Type |
|---|---|
| id | UUID |
| full_name | varchar |
| email | varchar |
| phone | varchar |
| password_hash | varchar |
| role_id | UUID |
| department | varchar |
| active | boolean |
| created_at | timestamp |
| updated_at | timestamp |

## 12.2 Bảng roles

| Field | Type |
|---|---|
| id | UUID |
| code | varchar |
| name | varchar |
| permissions | jsonb |

## 12.3 Bảng vehicles

| Field | Type |
|---|---|
| id | UUID |
| vehicle_code | varchar |
| vehicle_type | varchar |
| vehicle_name | varchar |
| max_weight_kg | numeric |
| max_volume_m3 | numeric |
| operating_area | varchar |
| fuel_cost_per_km | numeric |
| fixed_trip_cost | numeric |
| active | boolean |

## 12.4 Bảng drivers

| Field | Type |
|---|---|
| id | UUID |
| user_id | UUID |
| full_name | varchar |
| phone | varchar |
| default_vehicle_id | UUID |
| license_type | varchar |
| active | boolean |

## 12.5 Bảng dispatch_requests

| Field | Type |
|---|---|
| id | UUID |
| request_code | varchar |
| request_type | varchar |
| priority | varchar |
| status | varchar |
| created_by | UUID |
| department | varchar |
| cargo_type | varchar |
| weight_kg | numeric |
| volume_m3 | numeric |
| is_bulky | boolean |
| cargo_value | numeric |
| note | text |
| score | numeric |
| classification | varchar |
| created_at | timestamp |
| updated_at | timestamp |

## 12.6 Bảng dispatch_points

| Field | Type |
|---|---|
| id | UUID |
| request_id | UUID |
| point_type | varchar |
| location_name | varchar |
| address | text |
| lat | numeric |
| lng | numeric |
| contact_name | varchar |
| contact_phone | varchar |
| time_window_start | timestamp |
| time_window_end | timestamp |
| service_time_minutes | integer |
| sequence_rule | varchar |

## 12.7 Bảng route_plans

| Field | Type |
|---|---|
| id | UUID |
| route_code | varchar |
| vehicle_id | UUID |
| driver_id | UUID |
| status | varchar |
| departure_time | timestamp |
| estimated_distance_km | numeric |
| estimated_duration_minutes | numeric |
| estimated_cost | numeric |
| optimization_run_id | UUID |
| approved_by | UUID |
| approved_at | timestamp |
| created_at | timestamp |

## 12.8 Bảng route_stops

| Field | Type |
|---|---|
| id | UUID |
| route_plan_id | UUID |
| request_id | UUID |
| dispatch_point_id | UUID |
| stop_sequence | integer |
| planned_arrival_time | timestamp |
| actual_arrival_time | timestamp |
| planned_departure_time | timestamp |
| actual_departure_time | timestamp |
| status | varchar |
| note | text |

## 12.9 Bảng optimization_runs

| Field | Type |
|---|---|
| id | UUID |
| run_code | varchar |
| run_type | varchar |
| input_snapshot | jsonb |
| output_snapshot | jsonb |
| total_cost | numeric |
| total_distance_km | numeric |
| total_duration_minutes | numeric |
| created_by | UUID |
| created_at | timestamp |

## 12.10 Bảng dispatcher_overrides

| Field | Type |
|---|---|
| id | UUID |
| route_plan_id | UUID |
| changed_by | UUID |
| change_type | varchar |
| old_value | jsonb |
| new_value | jsonb |
| reason | text |
| created_at | timestamp |

## 12.11 Bảng system_settings

| Field | Type |
|---|---|
| id | UUID |
| key | varchar |
| value | jsonb |
| description | text |
| updated_at | timestamp |

---

# 13. API Specification

## 13.1 Auth

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | /auth/login | Đăng nhập |
| POST | /auth/logout | Đăng xuất |
| GET | /auth/me | Lấy thông tin user hiện tại |

## 13.2 Dispatch Requests

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | /dispatch-requests | Danh sách yêu cầu |
| POST | /dispatch-requests | Tạo yêu cầu |
| GET | /dispatch-requests/{id} | Chi tiết yêu cầu |
| PUT | /dispatch-requests/{id} | Cập nhật yêu cầu |
| POST | /dispatch-requests/{id}/submit | Gửi yêu cầu |
| POST | /dispatch-requests/{id}/cancel | Hủy yêu cầu |

## 13.3 Vehicles

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | /vehicles | Danh sách xe |
| POST | /vehicles | Tạo xe |
| PUT | /vehicles/{id} | Cập nhật xe |
| DELETE | /vehicles/{id} | Ngưng sử dụng xe |

## 13.4 Drivers

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | /drivers | Danh sách tài xế |
| POST | /drivers | Tạo tài xế |
| PUT | /drivers/{id} | Cập nhật tài xế |

## 13.5 Routing

| Method | Endpoint | Mục đích |
|---|---|---|
| POST | /routing/score-requests | Chấm điểm đơn |
| POST | /routing/classify-requests | Phân loại đơn |
| POST | /routing/vehicle-match | Đề xuất xe |
| POST | /routing/preview | Xem tuyến đề xuất |
| POST | /routing/optimize | Chạy tối ưu tuyến |
| POST | /routing/recalculate | Tính lại tuyến |
| POST | /routing/route-cost | Tính chi phí tuyến |
| GET | /routing/config | Xem cấu hình routing |
| PUT | /routing/config | Cập nhật cấu hình routing |

## 13.6 Routes

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | /routes | Danh sách tuyến |
| GET | /routes/{id} | Chi tiết tuyến |
| POST | /routes/{id}/approve | Duyệt tuyến |
| POST | /routes/{id}/assign | Phân tài xế |
| POST | /routes/{id}/start | Bắt đầu tuyến |
| POST | /routes/{id}/complete | Hoàn tất tuyến |
| POST | /routes/{id}/cancel | Hủy tuyến |

## 13.7 Driver

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | /driver/routes/today | Tuyến hôm nay |
| GET | /driver/routes/{id} | Chi tiết tuyến |
| POST | /driver/stops/{id}/arrived | Đã đến điểm |
| POST | /driver/stops/{id}/pickup-completed | Đã lấy hàng |
| POST | /driver/stops/{id}/delivery-completed | Đã giao hàng |
| POST | /driver/stops/{id}/failed | Báo thất bại |

## 13.8 Reports

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | /reports/daily | Báo cáo ngày |
| GET | /reports/cost | Báo cáo chi phí |
| GET | /reports/vehicle-performance | Hiệu suất xe |
| GET | /reports/driver-performance | Hiệu suất tài xế |
| GET | /reports/on-time-rate | Tỷ lệ đúng hẹn |

---

# 14. UI Specification

## 14.1 Login

Chức năng:

- Nhập email
- Nhập password
- Đăng nhập

## 14.2 Dashboard điều phối

Các khối chính:

1. Đơn cần xử lý ngay.
2. Đơn có thể gom chuyến.
3. Đơn lỗi địa chỉ/thời gian.
4. Tuyến đề xuất xe máy.
5. Tuyến đề xuất xe tải.
6. Cảnh báo.
7. Nút chạy tối ưu.
8. Nút duyệt tuyến.

## 14.3 Màn hình tạo yêu cầu

Các section:

1. Thông tin chung.
2. Thông tin hàng hóa.
3. Điểm lấy.
4. Điểm giao.
5. Thời gian lấy/giao.
6. Ghi chú.
7. Nút lưu nháp.
8. Nút gửi yêu cầu.

## 14.4 Danh sách yêu cầu

Cột dữ liệu:

- Mã yêu cầu
- Loại
- Người tạo
- Địa điểm lấy
- Địa điểm giao
- Deadline
- Ưu tiên
- Trạng thái
- Điểm hệ thống
- Nhóm xử lý

Filter:

- Theo ngày
- Theo trạng thái
- Theo người tạo
- Theo ưu tiên
- Theo khu vực
- Theo loại xe đề xuất

## 14.5 Bản đồ điều phối

Hiển thị:

- Kho
- Điểm lấy
- Điểm giao
- Tuyến xe máy
- Tuyến xe tải
- Thứ tự điểm dừng
- Màu theo trạng thái

## 14.6 Chi tiết tuyến

Hiển thị:

- Mã tuyến
- Xe
- Tài xế
- Thời điểm xuất phát
- Tổng km
- Tổng thời gian
- Tổng chi phí
- Danh sách điểm dừng
- Cảnh báo
- Giải thích tối ưu

## 14.7 Giao diện tài xế

Mobile responsive.

Hiển thị:

- Tuyến hôm nay
- Nút bắt đầu tuyến
- Danh sách điểm dừng
- Thông tin liên hệ
- Nút gọi điện
- Nút mở bản đồ dẫn đường
- Nút cập nhật trạng thái

## 14.8 Báo cáo

Các báo cáo:

- Tổng số yêu cầu theo ngày
- Số tuyến theo ngày
- Tổng km
- Tổng chi phí
- Chi phí theo xe
- Chi phí theo tài xế
- Tỷ lệ đúng hẹn
- Đơn thất bại

---

# 15. Cấu hình hệ thống

Các giá trị mặc định:

| Key | Default |
|---|---|
| urgent_threshold_minutes | 120 |
| motorbike_max_weight_kg | 50 |
| motorbike_inner_city_only | true |
| truck_max_weight_kg | 1000 |
| service_time_per_stop_minutes | 10 |
| minimum_group_size_for_trip | 2 |
| late_penalty_per_minute | 10000 |
| empty_run_penalty | 1.2 |
| max_waiting_time_for_grouping_minutes | 120 |
| default_driver_cost_per_minute | 1000 |
| motorbike_fuel_cost_per_km | 1000 |
| truck_fuel_cost_per_km | 5000 |
| default_depot_lat | null |
| default_depot_lng | null |

---

# 16. Tech Stack

## 16.1 Frontend

Đề xuất:

- Angular

Lý do:

- Phù hợp ứng dụng quản trị doanh nghiệp.
- Dễ tổ chức module.
- Có thể mở rộng.

## 16.2 Backend

Đề xuất:

- NestJS

Lý do:

- Kiến trúc rõ ràng.
- Phù hợp TypeScript full-stack.
- Dễ tạo API chuẩn.

## 16.3 Database

- PostgreSQL

## 16.4 Map

- OpenStreetMap

## 16.5 Routing

- OSRM self-host

## 16.6 Optimization

- Google OR-Tools

## 16.7 Deployment

- Docker Compose
- Server công ty
- Không phụ thuộc SaaS hàng tháng

---

# 17. Kiến trúc hệ thống

```text
Frontend NEXTJS, REACH
        |
        v
Backend NestJS API
        |
        +--> PostgreSQL
        |
        +--> Routing Service
        |       |
        |       +--> OSRM
        |
        +--> Optimization Service
                |
                +--> OR-Tools
```

## 17.1 Module Backend

```text
src/
  auth/
  users/
  roles/
  vehicles/
  drivers/
  dispatch-requests/
  dispatch-points/
  routing/
  optimization/
  route-plans/
  route-stops/
  reports/
  settings/
```

---

# 18. Cấu trúc thư mục đề xuất

```text
project-root/
  apps/
    frontend/
    backend/
  services/
    osrm/
    optimization/
  database/
    migrations/
    seed/
  docs/
    01-prd.md
    02-business-rules.md
    03-routing-engine-spec.md
    04-database-design.md
    05-api-spec.md
    06-ui-spec.md
    07-deployment.md
  docker-compose.yml
  README.md
```

---

# 19. Testing Specification

## 19.1 Unit Test

Cần test:

- Chấm điểm đơn.
- Phân loại đơn.
- Phân xe.
- Tính chi phí.
- Kiểm tra tải trọng.
- Kiểm tra time window.

## 19.2 Integration Test

Cần test:

- Tạo yêu cầu → Submit → Điều phối.
- Chạy tối ưu → Tạo route.
- Duyệt route → Tài xế nhận.
- Tài xế cập nhật trạng thái → Hoàn tất.

## 19.3 Routing Test Case

### Case 1

Đơn nhẹ nội thành, không cồng kềnh.

Kỳ vọng:

- Đề xuất xe máy.

### Case 2

Đơn nặng 100kg.

Kỳ vọng:

- Đề xuất xe tải.

### Case 3

Đơn deadline còn 1 giờ.

Kỳ vọng:

- Nhóm cần xử lý ngay.

### Case 4

3 đơn cùng quận, deadline cuối ngày.

Kỳ vọng:

- Gom chung một tuyến.

### Case 5

Gom chuyến làm trễ deadline.

Kỳ vọng:

- Không gom.

### Case 6

Thiếu tọa độ.

Kỳ vọng:

- Đưa vào invalid_requests.

---

# 20. Acceptance Criteria

## 20.1 Yêu cầu tạo đơn

Đạt khi:

- Sales/Purchasing tạo được đơn.
- Hệ thống bắt buộc nhập thời gian lấy/giao.
- Hệ thống không cho submit nếu thiếu dữ liệu quan trọng.

## 20.2 Yêu cầu routing

Đạt khi:

- Hệ thống phân loại được đơn gấp/chờ/gom.
- Hệ thống đề xuất xe phù hợp.
- Hệ thống tạo được tuyến cho xe máy và xe tải.
- Hệ thống tính được km, thời gian, chi phí.
- Hệ thống có giải thích lý do đề xuất.

## 20.3 Yêu cầu điều phối

Đạt khi:

- Dispatcher xem được tuyến đề xuất.
- Dispatcher duyệt được tuyến.
- Dispatcher chỉnh được tuyến và lưu lý do.

## 20.4 Yêu cầu tài xế

Đạt khi:

- Driver xem được tuyến.
- Driver cập nhật được trạng thái điểm dừng.
- Trạng thái đơn thay đổi theo hành động của driver.

## 20.5 Yêu cầu báo cáo

Đạt khi:

- Manager xem được tổng số đơn.
- Manager xem được tổng km.
- Manager xem được chi phí ước tính.
- Manager xem được tỷ lệ đúng hẹn.

---

# 21. Prompt tổng hợp cho AI Agent

```text
You are an expert full-stack software architect and coding agent.

Build a standalone Internal Dispatch Optimization System for a company logistics team.

The system is NOT an ERP. It is focused only on internal pickup, delivery, dispatch planning, vehicle assignment, route optimization, and delivery cost reduction.

Business context:
- Current fleet: 1 motorbike and 1 truck.
- Future fleet: multiple motorbikes and trucks.
- Daily requests: 20–30 pickup/delivery requests.
- Motorbike operates mainly inner-city.
- Truck can operate inner-city and outer-city.
- Sales and Purchasing users can create pickup/delivery requests.
- The company currently has no software or Excel workflow.
- The company wants zero monthly SaaS cost.

Main objective:
Minimize delivery cost while maintaining pickup/delivery time commitments.

The system must decide:
1. Which request must be handled immediately.
2. Which request can wait.
3. Which requests can be grouped.
4. Which vehicle should handle each request.
5. When the vehicle should depart.
6. What route order minimizes cost without violating constraints.

Required tech stack:
- Frontend: Angular.
- Backend: NestJS.
- Database: PostgreSQL.
- Map: OpenStreetMap.
- Routing: OSRM self-host.
- Optimization: Google OR-Tools.
- Deployment: Docker Compose.

Implement:
- Authentication and role-based permissions.
- Dispatch request creation.
- Pickup and delivery time windows.
- Vehicle management.
- Driver management.
- Request scoring.
- Request classification.
- Vehicle recommendation.
- Route optimization.
- Dispatcher approval.
- Driver mobile responsive route view.
- Stop status updates.
- Basic reports.
- Routing engine with explainable decisions.

Follow the PRD, business rules, routing engine specification, database design, API specification, UI specification, testing specification, and acceptance criteria in this document.
```

---

# 22. Nguyên tắc quan trọng cho AI Agent

Không được xây hệ thống theo hướng chỉ là danh sách đơn giao nhận.

Phải xây hệ thống theo hướng:

```text
Decision-first Dispatch System
```

Tức là hệ thống phải chủ động hỗ trợ ra quyết định:

- Có đi ngay không?
- Có chờ gom không?
- Có gom với đơn nào?
- Đi xe nào?
- Đi lúc mấy giờ?
- Đi tuyến nào?
- Chi phí bao nhiêu?
- Vì sao chọn phương án đó?

---

# 23. Kết luận

Tài liệu này là đặc tả tổng hợp để AI Agent bắt đầu xây dựng hệ thống.

Ưu tiên triển khai:

1. Database schema.
2. Backend API.
3. Request workflow.
4. Routing Engine MVP.
5. Dispatcher dashboard.
6. Driver mobile view.
7. Reports.
8. OSRM/OR-Tools integration.

Giá trị cốt lõi của phần mềm là:

**Giảm chi phí giao nhận thông qua tối ưu thời điểm xuất phát, gom chuyến, phân xe và tối ưu thứ tự điểm dừng.**
