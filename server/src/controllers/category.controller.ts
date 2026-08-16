import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category.model';
import { sendSuccess } from '../utils/response';

export const categoryController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await Category.find().sort({ name: 1 }).lean();
      sendSuccess(res, { categories });
    } catch (err) { next(err); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, icon, color } = req.body;
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const category = await Category.create({ name, slug, description, icon, color });
      sendSuccess(res, { category }, 201);
    } catch (err) { next(err); }
  },
};
