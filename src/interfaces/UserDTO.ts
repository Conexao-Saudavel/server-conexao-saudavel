import { UserType, Gender } from '../entities/User.js';

export interface UserDTO {
    id?: string;
    username: string;
    email: string;
    password?: string;
    full_name: string;
    date_of_birth: Date;
    gender: Gender;
    institution_id?: string;
    user_type: UserType;
    active?: boolean;
    onboarding_completed?: boolean;
    settings?: Record<string, any>;
    created_at?: Date;
    updated_at?: Date;
}

export interface UserResponseDTO extends Omit<UserDTO, 'password'> {
    institution?: {
        id: string;
        name: string;
        email: string;
    };
} 