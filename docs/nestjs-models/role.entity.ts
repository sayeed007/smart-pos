import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinColumn,
    JoinTable,
    Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('roles')
@Index(['tenantId', 'name'], { unique: true })
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_system', default: false })
    isSystem: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Tenant, (tenant) => tenant.roles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    })
    permissions: Permission[];

    @ManyToMany(() => User, (user) => user.roles)
    users: User[];
}
