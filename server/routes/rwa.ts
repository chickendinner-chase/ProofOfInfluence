import type { Request, Response } from 'express';
import { RWA_ITEMS } from '../config/rwa-items';

export function getRwaItems(req: Request, res: Response) {
  const items = [...RWA_ITEMS].sort((a, b) => a.sortOrder - b.sortOrder);
  res.json({ items });
}
