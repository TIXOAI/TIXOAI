export default async function handler(req, res) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return res.status(500).json({ ok:false, error:'ADMIN_KEY is not configured' });
  const supplied = req.headers['x-admin-key'];
  if (!supplied || supplied !== adminKey) return res.status(401).json({ ok:false, error:'Unauthorized' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !secretKey) return res.status(500).json({ ok:false, error:'Server is not configured' });

  try {
    if (req.method === 'GET') {
      const url = new URL(`${supabaseUrl}/rest/v1/leads`);
      url.searchParams.set('select','*'); url.searchParams.set('order','created_at.desc'); url.searchParams.set('limit','100');
      const r = await fetch(url,{headers:{apikey:secretKey,Authorization:`Bearer ${secretKey}`}});
      const t=await r.text(); if(!r.ok) return res.status(502).json({ok:false,error:'Supabase rejected the request'});
      return res.status(200).json({ok:true,leads:JSON.parse(t||'[]')});
    }
    if (req.method === 'PATCH') {
      const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
      const id=String(body.id||'').trim(), status=String(body.status||'').trim();
      const allowed=['new','contacted','in_progress','done','cancelled'];
      if(!id || !allowed.includes(status)) return res.status(400).json({ok:false,error:'Invalid id or status'});
      const url=new URL(`${supabaseUrl}/rest/v1/leads`); url.searchParams.set('id',`eq.${id}`);
      const r=await fetch(url,{method:'PATCH',headers:{apikey:secretKey,Authorization:`Bearer ${secretKey}`,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({status,updated_at:new Date().toISOString()})});
      const t=await r.text(); if(!r.ok) return res.status(502).json({ok:false,error:'Supabase rejected the update'});
      return res.status(200).json({ok:true,lead:JSON.parse(t||'[]')[0]||null});
    }
    res.setHeader('Allow','GET, PATCH'); return res.status(405).json({ok:false,error:'Method not allowed'});
  } catch { return res.status(500).json({ok:false,error:'Unexpected server error'}); }
}
