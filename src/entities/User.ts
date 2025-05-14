import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Institution, Device, UserSettings } from './index.js';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password_hash!: string;

    @Column()
    full_name!: string;

    @Column({ type: 'date' })
    date_of_birth!: Date;

    @Column()
    gender!: string;

    @Column()
    institution_id!: string;

    @Column()
    user_type!: string;

    @Column({ default: true })
    active: boolean = true;

    @Column({ default: false })
    onboarding_completed: boolean = false;

    @Column({ type: 'jsonb', nullable: true })
    settings: Record<string, any> = {};

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relacionamentos
    @ManyToOne(() => Institution, (institution: Institution) => institution.users)
    @JoinColumn({ name: 'institution_id' })
    institution!: Institution;

    @OneToMany(() => Device, (device: Device) => device.user)
    devices: Device[] = [];

    @OneToMany(() => UserSettings, (settings: UserSettings) => settings.user)
    user_settings: UserSettings[] = [];
} 