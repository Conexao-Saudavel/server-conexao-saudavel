import { Request, Response, NextFunction } from 'express';
import { ReflectionService } from '../services/ReflectionService.js';
import { ReflectionCreateDTO } from '../dtos/reflection.dto.js';

export class ReflectionController {
  private reflectionService: ReflectionService;

  constructor() {
    this.reflectionService = new ReflectionService();
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: User not found' });
      }
      const user_id = req.user.id;
      const data: ReflectionCreateDTO = req.body;
      const reflection = await this.reflectionService.createReflection(user_id, data);
      return res.status(201).json(reflection);
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: User not found' });
      }
      const user_id = req.user.id;
      const reflections = await this.reflectionService.getUserReflections(user_id);
      return res.json(reflections);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: User not found' });
      }
      const user_id = req.user.id;
      const { id } = req.params;
      await this.reflectionService.deleteReflection(user_id, id);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
} 