import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1716499999999 implements MigrationInterface {
    name = 'CreateUsersTable1716499999999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar o tipo enum com os valores atualizados
        await queryRunner.query(`
            CREATE TYPE users_user_type_enum AS ENUM ('aluno', 'independente', 'institucional');
        `);

        // Criar a tabela users
        await queryRunner.query(`
            CREATE TABLE users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                user_type users_user_type_enum NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover a tabela
        await queryRunner.query(`DROP TABLE users;`);

        // Remover o tipo enum
        await queryRunner.query(`DROP TYPE users_user_type_enum;`);
    }
} 