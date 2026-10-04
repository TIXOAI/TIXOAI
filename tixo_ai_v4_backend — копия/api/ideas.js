const banks = {
  hook: [
    '3 ошибки, из-за которых канал выглядит дешевле, чем он есть',
    'Мы переделали один обычный пост — вот что изменилось',
    'Если бы мы запускали этот канал с нуля, сделали бы так',
    'Одна идея, которую можно превратить в 7 публикаций'
  ],
  transformation: [
    'До: хаотичный канал. После: понятная контент-система.',
    'До: один визуал на всё. После: единый TIXO style.',
    'До: публикации когда получится. После: календарь на неделю.'
  ],
  story: [
    'Клиент пришёл с одной проблемой — мы разложили её на контент.',
    'Как из одной идеи собрать пост, Shorts и серию сторис.',
    'Почему мы сначала строим систему, а уже потом выпускаем контент.'
  ]
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const type = String(body.type || 'hook').toLowerCase();
  const count = Math.min(Math.max(Number(body.count) || 3, 1), 10);
  const source = banks[type] || banks.hook;
  const ideas = Array.from({ length: count }, (_, i) => source[i % source.length]);
  return res.status(200).json({ ok: true, ideas, source: 'tixo-template-engine' });
}
