import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';

/**
 * DTO para requisição de login
 */
export class LoginRequestDto {
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Email é obrigatório' })
    email!: string;

    @IsString({ message: 'Senha deve ser uma string' })
    @IsNotEmpty({ message: 'Senha é obrigatória' })
    @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    password!: string;
}

/**
 * DTO para requisição de registro
 */
export class RegisterRequestDto {
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Email é obrigatório' })
    email!: string;

    @IsString({ message: 'Nome de usuário deve ser uma string' })
    @IsNotEmpty({ message: 'Nome de usuário é obrigatório' })
    username!: string;

    @IsString({ message: 'Senha deve ser uma string' })
    @IsNotEmpty({ message: 'Senha é obrigatória' })
    @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
    password!: string;

    @IsString({ message: 'Nome completo deve ser uma string' })
    @IsNotEmpty({ message: 'Nome completo é obrigatório' })
    full_name!: string;

    @IsDateString({}, { message: 'Data de nascimento inválida' })
    @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
    date_of_birth!: Date;

    @IsString({ message: 'Gênero deve ser uma string' })
    @IsNotEmpty({ message: 'Gênero é obrigatório' })
    @IsEnum(['masculino', 'feminino', 'outro'], { message: 'Gênero inválido' })
    gender!: string;

    @IsUUID('4', { message: 'ID da instituição inválido' })
    @IsOptional()
    institution_id?: string;

    @IsString({ message: 'Tipo de usuário deve ser uma string' })
    @IsNotEmpty({ message: 'Tipo de usuário é obrigatório' })
    @IsEnum(['independente', 'institucional', 'aluno'], { message: 'Tipo de usuário inválido' })
    user_type: string = 'independente';

    @IsOptional()
    @IsString({ message: 'Configurações devem ser uma string JSON' })
    settings?: string;
}

/**
 * DTO para resposta de autenticação
 */
export class AuthResponseDto {
    @IsUUID('4', { message: 'ID de usuário inválido' })
    id!: string;

    @IsEmail({}, { message: 'Email inválido' })
    email!: string;

    @IsString({ message: 'Nome de usuário deve ser uma string' })
    username!: string;

    @IsString({ message: 'Nome completo deve ser uma string' })
    full_name!: string;

    @IsUUID('4', { message: 'ID da instituição inválido' })
    institution_id!: string;

    @IsString({ message: 'Tipo de usuário deve ser uma string' })
    user_type!: string;

    @IsString({ message: 'Token de acesso deve ser uma string' })
    access_token!: string;

    @IsString({ message: 'Token de atualização deve ser uma string' })
    refresh_token!: string;

    @IsOptional()
    @IsString({ message: 'Configurações devem ser uma string JSON' })
    settings?: string;

    @IsOptional()
    @IsString({ message: 'Mensagem deve ser uma string' })
    message?: string;
}

/**
 * DTO para requisição de atualização de token
 */
export class RefreshTokenRequestDto {
    @IsString({ message: 'Token de atualização deve ser uma string' })
    @IsNotEmpty({ message: 'Token de atualização é obrigatório' })
    refresh_token!: string;
}

/**
 * DTO para requisição de recuperação de senha
 */
export class ForgotPasswordRequestDto {
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'Email é obrigatório' })
    email!: string;
}

/**
 * DTO para requisição de redefinição de senha
 */
export class ResetPasswordRequestDto {
    @IsString({ message: 'Token deve ser uma string' })
    @IsNotEmpty({ message: 'Token é obrigatório' })
    token!: string;

    @IsString({ message: 'Nova senha deve ser uma string' })
    @IsNotEmpty({ message: 'Nova senha é obrigatória' })
    @MinLength(6, { message: 'Nova senha deve ter no mínimo 6 caracteres' })
    new_password!: string;

    @IsString({ message: 'Confirmação de senha deve ser uma string' })
    @IsNotEmpty({ message: 'Confirmação de senha é obrigatória' })
    @MinLength(6, { message: 'Confirmação de senha deve ter no mínimo 6 caracteres' })
    confirm_password!: string;
} 