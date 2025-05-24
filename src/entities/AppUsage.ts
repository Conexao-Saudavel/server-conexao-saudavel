import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User.js';

@Entity('app_usages')
export class AppUsage {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: "uuid" })
    user_id!: string;

    @ManyToOne(() => User, user => user.app_usages)
    user!: User;

    @Column({ type: "varchar" })
    app_name!: string;

    @Column({ type: "varchar" })
    package_name!: string;

    @Column({ type: 'interval' })
    duration!: string;

    @Column({ type: 'timestamp' })
    start_time!: Date;

    @Column({ type: 'timestamp' })
    end_time!: Date;

    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updated_at!: Date;
}