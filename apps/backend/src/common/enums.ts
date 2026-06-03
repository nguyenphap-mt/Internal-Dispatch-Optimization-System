// Domain enums derived from the PRD (sections 5, 6, 7, 8).

export enum RoleCode {
  SALES = 'Sales',
  PURCHASING = 'Purchasing',
  DISPATCHER = 'Dispatcher',
  DRIVER = 'Driver',
  MANAGER = 'Manager',
  ADMIN = 'Admin',
}

export enum RequestType {
  PICKUP = 'Pickup',
  DELIVERY = 'Delivery',
  PICKUP_DELIVERY = 'PickupDelivery',
  INTERNAL = 'Internal',
}

export enum Priority {
  URGENT = 'Urgent',
  SAME_DAY = 'SameDay',
  FLEXIBLE = 'Flexible',
}

// Request lifecycle status (PRD section 8).
export enum RequestStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  WAITING_DISPATCH = 'WaitingDispatch',
  PLANNED = 'Planned',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'InProgress',
  PICKUP_COMPLETED = 'PickupCompleted',
  DELIVERY_COMPLETED = 'DeliveryCompleted',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  FAILED = 'Failed',
}

// Routing classification groups (PRD section 10.5).
export enum Classification {
  URGENT = 'Urgent', // Cần đi ngay (>= 80)
  NEXT_TRIP = 'NextTrip', // Chuyến gần nhất (50-79)
  GROUPABLE = 'Groupable', // Có thể gom (20-49)
  WAITING = 'Waiting', // Chờ (0-19)
  INVALID = 'Invalid', // Không hợp lệ (< 0)
}

export enum VehicleType {
  MOTORBIKE = 'Motorbike',
  TRUCK = 'Truck',
}

export enum OperatingArea {
  INNER_CITY = 'InnerCity',
  OUTER_CITY = 'OuterCity',
  BOTH = 'Both',
}

export enum PointType {
  PICKUP = 'Pickup',
  DELIVERY = 'Delivery',
  DEPOT = 'Depot',
}

export enum RoutePlanStatus {
  DRAFT = 'Draft',
  APPROVED = 'Approved',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum RouteStopStatus {
  PENDING = 'Pending',
  ARRIVED = 'Arrived',
  PICKUP_COMPLETED = 'PickupCompleted',
  DELIVERY_COMPLETED = 'DeliveryCompleted',
  FAILED = 'Failed',
}
