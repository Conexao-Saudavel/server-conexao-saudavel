import { User } from '../entities/User.js';

export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UserFilters extends PaginationOptions {
    active?: boolean;
    userType?: 'independente' | 'institucional' | 'aluno';
    institutionId?: string;
    searchTerm?: string;
    gender?: 'masculino' | 'feminino' | 'outro';
    minAge?: number;
    maxAge?: number;
}

export interface AppUsageStats {
    total_screen_time: string;
    app_breakdown: AppBreakdown[];
    engagement_metrics: EngagementMetrics;
    notifications?: {
        total_received: number;
        total_interacted: number;
        by_app: Record<string, number>;
    };
    goals?: {
        screen_time_goal: string;
        screen_time_achieved: string;
        goals_completed: number;
        goals_missed: number;
    };
}

export interface AppBreakdown {
    app_name: string;
    duration: string;
    percentage: number;
}

export interface EngagementMetrics {
    total_sessions: number;
    average_session_duration: string;
    most_used_app: string;
    most_used_category: string;
}

export interface UsageStats {
    total_screen_time: string;
    app_breakdown: AppBreakdown[];
    engagement_metrics: EngagementMetrics;
}

export interface UserWithStats {
    user: {
        id: string;
        email: string;
        username: string;
        full_name: string;
        user_type: 'independente' | 'institucional' | 'aluno';
        institution_id?: string;
        active: boolean;
        onboarding_completed: boolean;
        settings?: Record<string, any>;
    };
    usage_stats: UsageStats;
} 