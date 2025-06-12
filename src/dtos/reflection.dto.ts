export interface ReflectionCreateDTO {
  content: string;
}

export interface ReflectionResponseDTO {
  id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
} 