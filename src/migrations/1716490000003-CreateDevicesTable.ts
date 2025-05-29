import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDevicesTable1716490000003 implements MigrationInterface {
    name = 'CreateDevicesTable1716490000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela de dispositivos
        await queryRunner.query(`
            CREATE TABLE devices (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL,
                device_name VARCHAR(255) NOT NULL,
                device_type VARCHAR(255) NOT NULL,
                serial_number VARCHAR(255) NOT NULL UNIQUE,
                device_info JSONB DEFAULT '{}',
                active BOOLEAN NOT NULL DEFAULT true,
                last_sync_at TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT fk_devices_user
                    FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE
            );
        `);

        // Criar índices
        await queryRunner.query(`
            CREATE INDEX idx_devices_user ON devices(user_id);
            CREATE INDEX idx_devices_serial ON devices(serial_number);
        `);

        // Criar trigger para atualização automática de updated_at
        await queryRunner.query(`
            CREATE TRIGGER update_devices_updated_at
                BEFORE UPDATE ON devices
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover trigger
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
        `);

        // Remover índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_devices_user;
            DROP INDEX IF EXISTS idx_devices_serial;
        `);

        // Remover tabela
        await queryRunner.query(`DROP TABLE devices;`);
    }
} 