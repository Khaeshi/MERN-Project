export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  USER: 'user',
};

export const Permission = {
  // Dashboard
  ACCESS_DASHBOARD: [ROLES.ADMIN, ROLES.STAFF],

  // Menu
  VIEW_MENU:        [ROLES.ADMIN, ROLES.STAFF],
  CREATE_MENU:      [ROLES.ADMIN],
  EDIT_MENU:        [ROLES.ADMIN, ROLES.STAFF],
  DELETE_MENU:      [ROLES.ADMIN],

  // Users
  VIEW_USERS:       [ROLES.ADMIN],
  EDIT_USER:        [ROLES.ADMIN],
  DELETE_USER:      [ROLES.ADMIN],

  // Uploads
  MANAGE_UPLOADS:   [ROLES.ADMIN],

  // Orders (future use)
  VIEW_ORDERS:      [ROLES.ADMIN, ROLES.STAFF],
  UPDATE_ORDER:     [ROLES.ADMIN, ROLES.STAFF],
  DELETE_ORDER:     [ROLES.ADMIN],
};