import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTypeEnum1716500000000 implements MigrationInterface {
    name = 'UpdateUserTypeEnum1716500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primeiro, atualizar os valores existentes
        await queryRunner.query(`
            UPDATE users 
            SET user_type = CASE 
                WHEN user_type = 'adolescente' THEN 'aluno'
                WHEN user_type = 'responsavel' THEN 'independente'
                WHEN user_type = 'profissional' THEN 'institucional'
                ELSE user_type
            END
        `);

        // Depois, alterar o tipo do enum
        await queryRunner.query(`
            ALTER TYPE users_user_type_enum RENAME TO users_user_type_enum_old;
            CREATE TYPE users_user_type_enum AS ENUM ('independente', 'institucional', 'aluno');
            ALTER TABLE users 
                ALTER COLUMN user_type TYPE users_user_type_enum 
                USING user_type::text::users_user_type_enum;
            DROP TYPE users_user_type_enum_old;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Primeiro, alterar o tipo do enum de volta
        await queryRunner.query(`
            ALTER TYPE users_user_type_enum RENAME TO users_user_type_enum_new;
            CREATE TYPE users_user_type_enum AS ENUM ('adolescente', 'responsavel', 'profissional');
            ALTER TABLE users 
                ALTER COLUMN user_type TYPE users_user_type_enum 
                USING user_type::text::users_user_type_enum;
            DROP TYPE users_user_type_enum_new;
        `);

        // Depois, atualizar os valores de volta
        await queryRunner.query(`
            UPDATE users 
            SET user_type = CASE 
                WHEN user_type = 'aluno' THEN 'adolescente'
                WHEN user_type = 'independente' THEN 'responsavel'
                WHEN user_type = 'institucional' THEN 'profissional'
                ELSE user_type
            END
        `);
    }
} 