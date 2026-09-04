import { redirect } from 'next/navigation';

/**
 * Route Normalization:
 * Mengarahkan akses rute singular (/batutv-control/video) ke rute standar plural (/batutv-control/videos).
 */
export default function LegacyAdminVideoRedirectPage() {
  redirect('/batutv-control/videos');
}
