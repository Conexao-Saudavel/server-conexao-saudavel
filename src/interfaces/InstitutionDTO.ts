export interface InstitutionDTO {
    id?: string;
    name: string;
    cnpj?: string;
    email: string;
    phone?: string;
    address?: Record<string, any>;
    active?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface InstitutionResponseDTO extends InstitutionDTO {
    users?: {
        id: string;
        username: string;
        email: string;
        full_name: string;
        user_type: string;
    }[];
} 