import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './index.js';

@Entity('institutions')
export class Institution {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: "varchar" })
    name!: string;

    @Column({ type: "varchar", unique: true })
    cnpj!: string;

    @Column({ type: "varchar" })
    address!: string;

    @Column({ type: "varchar" })
    city!: string;

    @Column({ type: "varchar" })
    state!: string;

    @Column({ type: "varchar" })
    country!: string;

    @Column({ type: "varchar" })
    postal_code!: string;

    @Column({ type: "varchar" })
    phone!: string;

    @Column({ type: "varchar", unique: true })
    email!: string;

    @Column({ type: "boolean", default: true })
    active: boolean = true;

    @Column({ type: 'jsonb', nullable: true })
    settings: Record<string, any> = {};

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updated_at!: Date;

    // Relacionamentos
    @OneToMany(() => User, (user: User) => user.institution)
    users!: User[];
}