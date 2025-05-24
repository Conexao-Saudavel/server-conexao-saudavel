import Joi from 'joi';

// Schema base para IDs UUID
const uuidSchema = Joi.string().uuid().required();

// Schema para autenticação
export const authSchemas = {
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),

    register: Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        full_name: Joi.string().required(),
        date_of_birth: Joi.date().iso().required(),
        gender: Joi.string().valid('masculino', 'feminino', 'outro').required(),
        institution_id: Joi.string().uuid(),
        user_type: Joi.string().valid('independente', 'institucional', 'aluno').default('independente')
    }),

    refreshToken: Joi.object({
        refresh_token: Joi.string().required()
            .messages({
                'any.required': 'O token de atualização é obrigatório'
            })
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
            .messages({
                'string.email': 'Email inválido',
                'any.required': 'O email é obrigatório'
            })
    }),

    resetPassword: Joi.object({
        token: Joi.string().required()
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
    })
};

// Schema para usuários
export const userSchemas = {
    create: Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        full_name: Joi.string().required(),
        date_of_birth: Joi.date().iso().required(),
        gender: Joi.string().valid('M', 'F', 'O').required(),
        institution_id: uuidSchema,
        user_type: Joi.string().valid('ADOLESCENT', 'PARENT', 'PROFESSIONAL').required()
    }),

    update: Joi.object({
        full_name: Joi.string(),
        gender: Joi.string().valid('M', 'F', 'O'),
        active: Joi.boolean(),
        onboarding_completed: Joi.boolean(),
        settings: Joi.object()
    }).min(1)
};

// Schema para dispositivos
export const deviceSchemas = {
    register: Joi.object({
        device_id: uuidSchema,
        device_name: Joi.string().required(),
        device_model: Joi.string().required(),
        os_version: Joi.string().required(),
        app_version: Joi.string().required()
    }),

    update: Joi.object({
        device_name: Joi.string(),
        os_version: Joi.string(),
        app_version: Joi.string(),
        last_sync_at: Joi.date().iso()
    }).min(1)
};

// Schema para uso de aplicativos
export const appUsageSchemas = {
    sync: Joi.object({
        device_id: uuidSchema,
        events: Joi.array().items(
            Joi.object({
                id: uuidSchema,
                package_name: Joi.string().required(),
                app_name: Joi.string().required(),
                start_time: Joi.date().iso().required(),
                end_time: Joi.date().iso().required(),
                foreground: Joi.boolean().required(),
                category: Joi.string().required(),
                metadata: Joi.object()
            })
        ).min(1).required(),
        hash: Joi.string().required()
    })
};

// Schema para questionários
export const questionnaireSchemas = {
    create: Joi.object({
        title: Joi.string().required(),
        description: Joi.string(),
        questions: Joi.array().items(
            Joi.object({
                question_text: Joi.string().required(),
                question_type: Joi.string().valid('MULTIPLE_CHOICE', 'SCALE', 'TEXT').required(),
                options: Joi.array().items(Joi.string()).when('question_type', {
                    is: 'MULTIPLE_CHOICE',
                    then: Joi.required(),
                    otherwise: Joi.forbidden()
                }),
                required: Joi.boolean().default(false)
            })
        ).min(1).required(),
        active: Joi.boolean().default(true)
    }),

    response: Joi.object({
        questionnaire_id: uuidSchema,
        answers: Joi.array().items(
            Joi.object({
                question_id: uuidSchema,
                answer: Joi.alternatives().try(
                    Joi.string(),
                    Joi.number(),
                    Joi.boolean()
                ).required()
            })
        ).min(1).required()
    })
};

// Schema para instituições
export const institutionSchemas = {
    create: Joi.object({
        name: Joi.string().required(),
        cnpj: Joi.string().pattern(/^\d{14}$/).required(),
        address: Joi.object({
            street: Joi.string().required(),
            number: Joi.string().required(),
            complement: Joi.string(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            zip_code: Joi.string().pattern(/^\d{8}$/).required()
        }).required(),
        contact_email: Joi.string().email().required(),
        contact_phone: Joi.string().pattern(/^\d{10,11}$/).required()
    }),

    update: Joi.object({
        name: Joi.string(),
        address: Joi.object({
            street: Joi.string(),
            number: Joi.string(),
            complement: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            zip_code: Joi.string().pattern(/^\d{8}$/)
        }),
        contact_email: Joi.string().email(),
        contact_phone: Joi.string().pattern(/^\d{10,11}$/),
        active: Joi.boolean()
    }).min(1)
};

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

    confirm_password: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'As senhas não conferem',
            'any.required': 'A confirmação de senha é obrigatória'
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
        .valid('masculino', 'feminino', 'outro')
        .required()
        .messages({
            'any.only': 'Gênero inválido. Use masculino, feminino ou outro',
            'any.required': 'O gênero é obrigatório'
        }),

    institution_id: Joi.string()
        .uuid()
        .messages({
            'string.guid': 'ID da instituição inválido'
        }),

    user_type: Joi.string()
        .valid('independente', 'institucional', 'aluno')
        .default('independente')
        .messages({
            'any.only': 'Tipo de usuário inválido. Use independente, institucional ou aluno'
        }),

    settings: Joi.object()
        .default({})
        .messages({
            'object.base': 'As configurações devem ser um objeto'
        })
}); 