import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUpdateTimestampFunction1716490000001 implements MigrationInterface {
    name = 'CreateUpdateTimestampFunction1716490000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar função para atualização automática de updated_at
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover função
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);
    }
} 