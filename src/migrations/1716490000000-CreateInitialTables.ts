import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1716490000000 implements MigrationInterface {
    name = 'CreateInitialTables1716490000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar enum para tipo de usuário
        await queryRunner.query(`
            CREATE TYPE users_user_type_enum AS ENUM ('independente', 'institucional', 'aluno');
        `);

        // Criar enum para gênero
        await queryRunner.query(`
            CREATE TYPE users_gender_enum AS ENUM ('masculino', 'feminino', 'outro');
        `);

        // Criar tabela de instituições
        await queryRunner.query(`
            CREATE TABLE institutions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR NOT NULL,
                cnpj VARCHAR UNIQUE,
                email VARCHAR NOT NULL UNIQUE,
                phone VARCHAR,
                address JSONB,
                active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            );
        `);

        // Criar tabela de usuários
        await queryRunner.query(`
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                username VARCHAR NOT NULL UNIQUE,
                email VARCHAR NOT NULL UNIQUE,
                password_hash VARCHAR NOT NULL,
                full_name VARCHAR NOT NULL,
                date_of_birth DATE NOT NULL,
                gender users_gender_enum NOT NULL DEFAULT 'outro',
                institution_id UUID,
                user_type users_user_type_enum NOT NULL,
                active BOOLEAN NOT NULL DEFAULT true,
                onboarding_completed BOOLEAN NOT NULL DEFAULT false,
                settings JSONB DEFAULT '{}',
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            );
        `);

        // Adicionar chave estrangeira para institution_id
        await queryRunner.query(`
            ALTER TABLE users
            ADD CONSTRAINT fk_users_institution
            FOREIGN KEY (institution_id)
            REFERENCES institutions(id)
            ON DELETE SET NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover chave estrangeira
        await queryRunner.query(`
            ALTER TABLE users
            DROP CONSTRAINT fk_users_institution;
        `);

        // Remover tabelas
        await queryRunner.query(`DROP TABLE users;`);
        await queryRunner.query(`DROP TABLE institutions;`);

        // Remover enums
        await queryRunner.query(`DROP TYPE users_user_type_enum;`);
        await queryRunner.query(`DROP TYPE users_gender_enum;`);
    }
} 