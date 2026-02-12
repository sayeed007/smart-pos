import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';

@Entity('audit_logs')
@Index(['tenantId', 'entityType', 'entityId'])
@Index(['tenantId', 'userId', 'createdAt'])
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ length: 100 })
    action: string; // e.g., 'product.create', 'sale.void', 'refund.approve', 'price.override'

    @Column({ name: 'entity_type', length: 50 })
    entityType: string; // 'product', 'sale', 'inventory', 'customer'

    @Column({ name: 'entity_id', type: 'uuid' })
    entityId: string;

    @Column({ type: 'jsonb', nullable: true })
    changes: Record<string, any>; // { before: {...}, after: {...} }

    @Column({ name: 'ip_address', length: 45, nullable: true })
    ipAddress: string;

    @Column({ name: 'user_agent', type: 'text', nullable: true })
    userAgent: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => User, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
