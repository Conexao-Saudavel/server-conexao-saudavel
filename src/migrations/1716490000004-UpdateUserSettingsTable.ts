import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserSettingsTable1716490000004 implements MigrationInterface {
    name = 'UpdateUserSettingsTable1716490000004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primeiro, vamos fazer backup dos dados existentes
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS user_settings_backup AS 
            SELECT * FROM user_settings;
        `);

        // Remover a tabela existente
        await queryRunner.query(`
            DROP TABLE IF EXISTS user_settings;
        `);

        // Criar a nova tabela com a estrutura correta
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

        // Restaurar os dados do backup
        await queryRunner.query(`
            INSERT INTO user_settings (
                id, user_id, notification_preferences, 
                created_at, updated_at
            )
            SELECT 
                id, user_id, notification_preferences,
                created_at, updated_at
            FROM user_settings_backup;
        `);

        // Remover a tabela de backup
        await queryRunner.query(`
            DROP TABLE IF EXISTS user_settings_backup;
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

        // Restaurar a tabela original
        await queryRunner.query(`
            DROP TABLE IF EXISTS user_settings;
            CREATE TABLE user_settings (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) UNIQUE,
                daily_usage_limit INTEGER,
                notification_preferences JSONB DEFAULT '{}',
                app_categories JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }
} 