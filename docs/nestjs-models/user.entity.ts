import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
    Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Location } from './location.entity';
import { Role } from './role.entity';

@Entity('users')
@Index(['tenantId', 'email'], { unique: true, where: '"deleted_at" IS NULL' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 255 })
    email: string;

    @Column({ name: 'password_hash', length: 255 })
    passwordHash: string;

    @Column({ length: 50, nullable: true })
    phone: string;

    @Column({ name: 'avatar_url', type: 'text', nullable: true })
    avatarUrl: string;

    @Column({ length: 10, nullable: true })
    pin: string; // Hashed supervisor PIN

    @Column({
        type: 'enum',
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
    })
    status: 'active' | 'inactive' | 'suspended';

    @Column({ name: 'default_location_id', type: 'uuid', nullable: true })
    defaultLocationId: string;

    @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
    lastLoginAt: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
    deletedAt: Date;

    // Relations
    @ManyToOne(() => Tenant, (tenant) => tenant.users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Location, { nullable: true })
    @JoinColumn({ name: 'default_location_id' })
    defaultLocation: Location;

    @ManyToMany(() => Role, (role) => role.users, { eager: true })
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: Role[];
}
