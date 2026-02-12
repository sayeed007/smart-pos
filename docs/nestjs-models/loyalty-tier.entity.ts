import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('loyalty_tiers')
export class LoyaltyTier {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ length: 100 })
    name: string; // Bronze, Silver, Gold, Platinum

    @Column({ name: 'min_spend', type: 'decimal', precision: 12, scale: 2 })
    minSpend: number;

    @Column({ name: 'earn_rate', type: 'decimal', precision: 5, scale: 2 })
    earnRate: number; // Points per $1

    @Column({ length: 7, nullable: true })
    color: string; // Hex color for UI

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;
}
