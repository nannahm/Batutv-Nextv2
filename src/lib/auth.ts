import { auth } from './firebase';
import { getStoredAdminSession, saveAdminSession, clearAdminSession } from '@/src/utils/authSession';
import { normalizeUserRole, checkRoutePermission } from '@/src/utils/rbac';

export {
  auth,
  getStoredAdminSession,
  saveAdminSession,
  clearAdminSession,
  normalizeUserRole,
  checkRoutePermission,
};
