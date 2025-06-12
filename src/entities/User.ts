import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Institution, Device, UserSettings } from './index.js';
import bcrypt from 'bcrypt';
import { AppUsage } from './AppUsage.js';
import { DailySummary } from './DailySummary.js';
import { Reflection } from './Reflection.js';

export enum UserType {
    INDEPENDENTE = 'independente',
    INSTITUCIONAL = 'institucional',
    ALUNO = 'aluno'
}

export enum Gender {
    MASCULINO = 'masculino',
    FEMININO = 'feminino',
    OUTRO = 'outro'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: "varchar", unique: true })
    username!: string;

    @Column({ type: "varchar", unique: true })
    email!: string;

    @Column({ type: "varchar", name: 'password_hash' })
    password_hash!: string;

    @Column({ type: "varchar", name: 'full_name' })
    full_name!: string;

    @Column({
        name: 'date_of_birth',
        type: 'date'
    })
    date_of_birth!: Date;

    @Column({
        type: 'enum',
        enum: Gender,
        default: Gender.OUTRO
    })
    gender!: Gender;

    @Column({ type: "uuid", name: 'institution_id', nullable: true })
    institution_id?: string;

    @Column({
        name: 'user_type',
        type: 'enum',
        enum: UserType
    })
    user_type!: UserType;

    @Column({ type: "boolean", default: true })
    active!: boolean;

    @Column({
        type: "boolean",
        name: 'onboarding_completed',
        default: false
    })
    onboarding_completed!: boolean;

    @Column({
        type: 'jsonb',
        nullable: true,
        default: {}
    })
    settings!: Record<string, any>;

    @CreateDateColumn({ type: "timestamp", name: 'created_at' })
    created_at!: Date;

    @UpdateDateColumn({ type: "timestamp", name: 'updated_at' })
    updated_at!: Date;

    // Relacionamentos
    @ManyToOne(() => Institution, institution => institution.users)
    @JoinColumn({ name: 'institution_id' })
    institution!: Institution;

    @OneToMany(() => Device, device => device.user)
    devices!: Device[];

    @OneToMany(() => UserSettings, settings => settings.user)
    user_settings!: UserSettings[];

    @OneToMany(() => AppUsage, appUsage => appUsage.user)
    app_usages!: AppUsage[];

    @OneToMany(() => DailySummary, dailySummary => dailySummary.user)
    daily_summaries!: DailySummary[];

    @OneToMany(() => Reflection, reflection => reflection.user)
    reflections!: Reflection[];

    // Métodos para manipulação de senha
    async setPassword(password: string): Promise<void> {
        const salt = await bcrypt.genSalt(10);
        this.password_hash = await bcrypt.hash(password, salt);
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password_hash);
    }

    // Hooks do TypeORM
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        // Se a senha foi modificada (não é um hash)
        if (this.password_hash && !this.password_hash.startsWith('$2')) {
            await this.setPassword(this.password_hash);
        }
    }

    // Método para retornar dados públicos do usuário
    toJSON(): Partial<User> {
        const { password_hash, ...publicData } = this;
        return publicData;
    }
}
