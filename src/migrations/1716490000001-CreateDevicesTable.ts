import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDevicesTable1716490000001 implements MigrationInterface {
    name = 'CreateDevicesTable1716490000001'

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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_devices_user;
            DROP INDEX IF EXISTS idx_devices_serial;
        `);

        // Remover tabela
        await queryRunner.query(`DROP TABLE devices;`);
    }
} 