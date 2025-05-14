import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './index.js';

@Entity('institutions')
export class Institution {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    cnpj!: string;

    @Column()
    address!: string;

    @Column()
    city!: string;

    @Column()
    state!: string;

    @Column()
    country!: string;

    @Column()
    postal_code!: string;

    @Column()
    phone!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ default: true })
    active: boolean = true;

    @Column({ type: 'jsonb', nullable: true })
    settings: Record<string, any> = {};

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relacionamentos
    @OneToMany(() => User, (user: User) => user.institution)
    users: User[] = [];
} 