import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User.js';

@Entity('daily_summaries')
export class DailySummary {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, user => user.daily_summaries)
    user!: User;

    @Column('date')
    date!: Date;

    @Column('interval')
    total_screen_time!: string;

    @Column('jsonb')
    app_breakdown!: {
        app_name: string;
        duration: string;
        percentage: number;
    }[];

    @Column('jsonb')
    engagement_metrics!: {
        total_sessions: number;
        average_session_duration: string;
        most_used_app: string;
        most_used_category: string;
    };

    @Column('jsonb', { nullable: true })
    notifications?: {
        total_received: number;
        total_interacted: number;
        by_app: Record<string, number>;
    };

    @Column('jsonb', { nullable: true })
    goals?: {
        screen_time_goal: string;
        screen_time_achieved: string;
        goals_completed: number;
        goals_missed: number;
    };

    @Column('jsonb', { nullable: true })
    metadata?: Record<string, any>;

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at!: Date;
} 