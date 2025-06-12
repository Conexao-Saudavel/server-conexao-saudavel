import { getCustomRepository } from 'typeorm';
import { ReflectionRepository } from '../repositories/ReflectionRepository.js';
import { Reflection } from '../entities/Reflection.js';
import { ReflectionCreateDTO } from '../dtos/reflection.dto.js';

export class ReflectionService {
  private reflectionRepository: ReflectionRepository;

  constructor() {
    this.reflectionRepository = getCustomRepository(ReflectionRepository);
  }

  async createReflection(user_id: string, data: ReflectionCreateDTO): Promise<Reflection> {
    const reflection = this.reflectionRepository.create({
      user_id,
      content: data.content,
    });
    return this.reflectionRepository.save(reflection);
  }

  async getUserReflections(user_id: string): Promise<Reflection[]> {
    return this.reflectionRepository.find({
      where: { user_id },
      order: { created_at: 'DESC' },
    });
  }

  async deleteReflection(user_id: string, reflection_id: string): Promise<void> {
    await this.reflectionRepository.delete({ id: reflection_id, user_id });
  }
} 