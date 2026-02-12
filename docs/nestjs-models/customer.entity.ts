import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { LoyaltyTier } from './loyalty-tier.entity';
import { LoyaltyLog } from './loyalty-log.entity';

@Entity('customers')
@Index(['tenantId', 'phone'])
@Index(['tenantId', 'email'])
@Index(['tenantId', 'name'])
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 50, nullable: true })
    phone: string;

    @Column({ length: 255, nullable: true })
    email: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'total_spent', type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalSpent: number;

    @Column({ name: 'loyalty_points', type: 'int', default: 0 })
    loyaltyPoints: number;

    @Column({ name: 'tier_id', type: 'uuid', nullable: true })
    tierId: string;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active',
    })
    status: 'active' | 'inactive';

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
    deletedAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => LoyaltyTier, { nullable: true })
    @JoinColumn({ name: 'tier_id' })
    tier: LoyaltyTier;

    @OneToMany(() => LoyaltyLog, (log) => log.customer)
    loyaltyLogs: LoyaltyLog[];
}
