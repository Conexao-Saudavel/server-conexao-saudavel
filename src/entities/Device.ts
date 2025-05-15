import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './index.js';

@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: "uuid" })
    user_id!: string;

    @Column({ type: "varchar" })
    device_name!: string;

    @Column({ type: "varchar" })
    device_type!: string;

    @Column({ type: "varchar", unique: true })
    serial_number!: string;

    @Column({ type: 'jsonb', nullable: true })
    device_info: Record<string, any> = {};

    @Column({ type: "boolean", default: true })
    active: boolean = true;

    @Column({ type: 'timestamp', nullable: true })
    last_sync_at: Date | null = null;

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at!: Date;

    // Relacionamentos
    @ManyToOne(() => User, (user: User) => user.devices)
    @JoinColumn({ name: 'user_id' })
    user!: User;
}