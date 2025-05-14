import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './index.js';

@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    user_id!: string;

    @Column()
    device_name!: string;

    @Column()
    device_type!: string;

    @Column({ unique: true })
    serial_number!: string;

    @Column({ type: 'jsonb', nullable: true })
    device_info: Record<string, any> = {};

    @Column({ default: true })
    active: boolean = true;

    @Column({ type: 'timestamp', nullable: true })
    last_sync_at: Date | null = null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relacionamentos
    @ManyToOne(() => User, (user: User) => user.devices)
    @JoinColumn({ name: 'user_id' })
    user!: User;
} 