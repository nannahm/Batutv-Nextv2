/**
 * Next.js Route Handler: Webhooks Ingestion
 * POST /api/webhooks
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    return new Response(
      JSON.stringify({
        received: true,
        event: body.event || 'generic_webhook',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'Invalid payload',
        message: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
