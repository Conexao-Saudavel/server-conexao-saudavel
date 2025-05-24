import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './index.js';

@Entity('user_settings')
export class UserSettings {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: "uuid" })
    user_id!: string;

    @Column({ type: 'jsonb', nullable: true })
    notification_preferences: Record<string, any> = {};

    @Column({ type: 'jsonb', nullable: true })
    privacy_settings: Record<string, any> = {};

    @Column({ type: 'jsonb', nullable: true })
    theme_preferences: Record<string, any> = {};

    @Column({ type: 'jsonb', nullable: true })
    language_preferences: Record<string, any> = {};

    @Column({ type: 'jsonb', nullable: true })
    accessibility_settings: Record<string, any> = {};

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at!: Date;

    // Relacionamentos
    @ManyToOne(() => User, (user: User) => user.user_settings)
    @JoinColumn({ name: 'user_id' })
    user!: User;
}