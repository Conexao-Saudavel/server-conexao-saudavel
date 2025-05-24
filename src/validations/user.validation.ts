import Joi from 'joi';

// Schema base para IDs UUID
const uuidSchema = Joi.string().uuid().required();

/**
 * Schema de validação para atualização de usuário
 */
export const updateUserSchema = Joi.object({
    full_name: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'O nome completo deve ter no mínimo 3 caracteres',
            'string.max': 'O nome completo deve ter no máximo 100 caracteres'
        }),

    gender: Joi.string()
        .valid('M', 'F', 'O')
        .messages({
            'any.only': 'Gênero inválido. Use M (Masculino), F (Feminino) ou O (Outro)'
        }),

    settings: Joi.object()
        .messages({
            'object.base': 'As configurações devem ser um objeto válido'
        })
}).min(1).messages({
    'object.min': 'Pelo menos um campo deve ser fornecido para atualização'
});

/**
 * Schema de validação para login
 */
export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Email inválido',
            'any.required': 'O email é obrigatório'
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'A senha deve ter no mínimo 6 caracteres',
            'any.required': 'A senha é obrigatória'
        })
});

/**
 * Schema de validação para refresh token
 */
export const refreshTokenSchema = Joi.object({
    refresh_token: Joi.string()
        .required()
        .messages({
            'any.required': 'O token de atualização é obrigatório'
        })
});

/**
 * Schema de validação para recuperação de senha
 */
export const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Email inválido',
            'any.required': 'O email é obrigatório'
        })
});

/**
 * Schema de validação para redefinição de senha
 */
export const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'O token é obrigatório'
        }),
    
    new_password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
            'string.min': 'A senha deve ter no mínimo 8 caracteres',
            'any.required': 'A nova senha é obrigatória'
        }),
    
    confirm_password: Joi.string()
        .valid(Joi.ref('new_password'))
        .required()
        .messages({
            'any.only': 'As senhas não conferem',
            'any.required': 'A confirmação de senha é obrigatória'
        })
});

/**
 * Schema de validação para registro de usuário
 */
export const registerSchema = Joi.object({
    username: Joi.string()
        .min(3)
        .max(30)
        .pattern(/^[a-zA-Z0-9_]+$/)
        .required()
        .messages({
            'string.pattern.base': 'O username deve conter apenas letras, números e underscore',
            'string.min': 'O username deve ter no mínimo 3 caracteres',
            'string.max': 'O username deve ter no máximo 30 caracteres',
            'any.required': 'O username é obrigatório'
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Email inválido',
            'any.required': 'O email é obrigatório'
        }),

    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
            'string.min': 'A senha deve ter no mínimo 8 caracteres',
            'any.required': 'A senha é obrigatória'
        }),

    full_name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'O nome completo deve ter no mínimo 3 caracteres',
            'string.max': 'O nome completo deve ter no máximo 100 caracteres',
            'any.required': 'O nome completo é obrigatório'
        }),

    date_of_birth: Joi.date()
        .max('now')
        .required()
        .messages({
            'date.max': 'A data de nascimento não pode ser futura',
            'any.required': 'A data de nascimento é obrigatória'
        }),

    gender: Joi.string()
        .valid('M', 'F', 'O')
        .required()
        .messages({
            'any.only': 'Gênero inválido. Use M (Masculino), F (Feminino) ou O (Outro)',
            'any.required': 'O gênero é obrigatório'
        }),

    institution_id: Joi.string()
        .uuid()
        .required()
        .messages({
            'string.guid': 'ID da instituição inválido',
            'any.required': 'O ID da instituição é obrigatório'
        }),

    user_type: Joi.string()
        .valid('ADOLESCENT', 'PARENT', 'PROFESSIONAL')
        .required()
        .messages({
            'any.only': 'Tipo de usuário inválido',
            'any.required': 'O tipo de usuário é obrigatório'
        })
});