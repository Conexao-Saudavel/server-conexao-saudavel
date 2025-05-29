import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserSettingsTable1716490000002 implements MigrationInterface {
    name = 'CreateUserSettingsTable1716490000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela de configurações do usuário
        await queryRunner.query(`
            CREATE TABLE user_settings (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL,
                notification_preferences JSONB DEFAULT '{}',
                privacy_settings JSONB DEFAULT '{}',
                theme_preferences JSONB DEFAULT '{}',
                language_preferences JSONB DEFAULT '{}',
                accessibility_settings JSONB DEFAULT '{}',
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT fk_user_settings_user
                    FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            );
        `);

        // Criar índices
        await queryRunner.query(`
            CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
        `);

        // Criar trigger para atualização automática de updated_at
        await queryRunner.query(`
            CREATE TRIGGER update_user_settings_updated_at
                BEFORE UPDATE ON user_settings
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover trigger
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
        `);

        // Remover índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_user_settings_user_id;
        `);

        // Remover tabela
        await queryRunner.query(`DROP TABLE IF EXISTS user_settings;`);
    }
} 