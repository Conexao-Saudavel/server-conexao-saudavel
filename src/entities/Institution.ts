import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './index.js';

@Entity('institutions')
export class Institution {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", unique: true, nullable: true })
    cnpj?: string;

    @Column({ type: "varchar", unique: true })
    email!: string;

    @Column({ type: "varchar", nullable: true })
    phone?: string;

    @Column({ type: "jsonb", nullable: true })
    address?: Record<string, any>;

    @Column({ type: "boolean", default: true })
    active!: boolean;

    @CreateDateColumn({ type: "timestamp", name: 'created_at' })
    created_at!: Date;

    @UpdateDateColumn({ type: "timestamp", name: 'updated_at' })
    updated_at!: Date;

    // Relacionamentos
    @OneToMany(() => User, (user: User) => user.institution)
    users!: User[];
}