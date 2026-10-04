export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const fields = ['niche', 'quantity', 'format', 'budget', 'goal', 'brief'];
    const lead = Object.fromEntries(fields.map((key) => [key, String(body[key] ?? '').trim()]));

    if (!lead.niche) return res.status(400).json({ ok: false, error: 'niche is required' });

    const supabaseUrl = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !secretKey) {
      return res.status(500).json({ ok: false, error: 'Server is not configured for Supabase' });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        ...lead,
        status: 'new',
        source: 'website'
      })
    });

    const text = await response.text();
    if (!response.ok) {
      return res.status(502).json({ ok: false, error: 'Supabase rejected the lead', detail: text.slice(0, 500) });
    }

    const rows = JSON.parse(text || '[]');
    const id = rows?.[0]?.id || null;
    const telegramText = [
      '🔥 TIXO AI — новая заявка',
      '',
      `Ниша: ${lead.niche || '—'}`,
      `Количество: ${lead.quantity || '—'}`,
      `Формат: ${lead.format || '—'}`,
      `Бюджет: ${lead.budget || '—'}`,
      `Цель: ${lead.goal || '—'}`,
      `Бриф: ${lead.brief || '—'}`
    ].join('\n');

    return res.status(200).json({
      ok: true,
      lead_id: id,
      telegram_url: `https://t.me/tixoebem?text=${encodeURIComponent(telegramText)}`
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Unexpected server error' });
  }
}
