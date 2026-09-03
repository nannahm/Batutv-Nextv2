/**
 * Next.js Route Handler: Health Check
 * GET /api/health
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      service: 'BatuTV News Portal Enterprise Core',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}
