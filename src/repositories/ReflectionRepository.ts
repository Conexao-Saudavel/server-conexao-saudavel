import { EntityRepository, Repository } from 'typeorm';
import { Reflection } from '../entities/Reflection.js';

@EntityRepository(Reflection)
export class ReflectionRepository extends Repository<Reflection> {
  // Métodos customizados podem ser adicionados aqui futuramente
} 