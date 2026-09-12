import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../_lib/cors';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method === 'GET') {
    res.status(200).json({ success: true, data: [] });
    return;
  }

  if (req.method === 'POST') {
    res.status(200).json({ success: true, data: req.body });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
