// Serves inventory items to the order form — runs server-side so no CORS issues.
export async function onRequestGet({ env }) {
  const SUPABASE_URL = env.SUPABASE_URL     || 'https://xlkbmabqsjyxcreqrlrw.supabase.co';
  const ANON_KEY     = env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsa2JtYWJxc2p5eGNyZXFybHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1ODkzMTMsImV4cCI6MjA5ODE2NTMxM30.VQq-pc6QvqMQbUyOgk2cWtdNZiIv4rjmW9GSAAMVl1E';
  const CLIENT_ID    = env.BURNETTS_CLIENT_ID || 'acbc5e5e-bba2-4888-979f-52782fd7b9f8';

  try {
    const query = [
      'client_id=eq.' + CLIENT_ID,
      'show_on_order_form=eq.true',
      'active=eq.true',
      'stock=gt.0',
      'select=id,name,category,unit,price,image_url',
      'order=category,name',
    ].join('&');

    const res = await fetch(`${SUPABASE_URL}/rest/v1/inventory?${query}`, {
      headers: {
        'apikey':        ANON_KEY,
        'Authorization': 'Bearer ' + ANON_KEY,
      },
    });

    if (!res.ok) throw new Error('Supabase error ' + res.status);
    const items = await res.json();

    return new Response(JSON.stringify(items), {
      status: 200,
      headers: {
        'Content-Type':  'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
