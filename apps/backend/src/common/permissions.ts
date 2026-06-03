import { RoleCode } from './enums';

// Permission keys map to capabilities described per role in PRD section 5.
export enum Permission {
  REQUEST_CREATE = 'request.create',
  REQUEST_VIEW_OWN = 'request.view_own',
  REQUEST_VIEW_ALL = 'request.view_all',
  REQUEST_CANCEL_OWN = 'request.cancel_own',
  REQUEST_EDIT = 'request.edit',

  ROUTING_RUN = 'routing.run',
  ROUTE_APPROVE = 'route.approve',
  ROUTE_EDIT = 'route.edit',
  ROUTE_ASSIGN = 'route.assign',
  ROUTE_CANCEL = 'route.cancel',

  DRIVER_VIEW_OWN_ROUTES = 'driver.view_own_routes',
  DRIVER_UPDATE_STATUS = 'driver.update_status',

  REPORT_VIEW = 'report.view',

  USER_MANAGE = 'user.manage',
  ROLE_MANAGE = 'role.manage',
  VEHICLE_MANAGE = 'vehicle.manage',
  DRIVER_MANAGE = 'driver.manage',
  SETTINGS_MANAGE = 'settings.manage',
}

export const ROLE_PERMISSIONS: Record<RoleCode, Permission[]> = {
  [RoleCode.SALES]: [
    Permission.REQUEST_CREATE,
    Permission.REQUEST_VIEW_OWN,
    Permission.REQUEST_CANCEL_OWN,
  ],
  [RoleCode.PURCHASING]: [
    Permission.REQUEST_CREATE,
    Permission.REQUEST_VIEW_OWN,
    Permission.REQUEST_CANCEL_OWN,
  ],
  [RoleCode.DISPATCHER]: [
    Permission.REQUEST_VIEW_ALL,
    Permission.REQUEST_EDIT,
    Permission.ROUTING_RUN,
    Permission.ROUTE_APPROVE,
    Permission.ROUTE_EDIT,
    Permission.ROUTE_ASSIGN,
    Permission.ROUTE_CANCEL,
    Permission.REPORT_VIEW,
  ],
  [RoleCode.DRIVER]: [
    Permission.DRIVER_VIEW_OWN_ROUTES,
    Permission.DRIVER_UPDATE_STATUS,
  ],
  [RoleCode.MANAGER]: [
    Permission.REQUEST_VIEW_ALL,
    Permission.REPORT_VIEW,
  ],
  [RoleCode.ADMIN]: Object.values(Permission),
};
