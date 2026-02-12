import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('tax_profiles')
export class TaxProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ length: 100 })
    name: string; // e.g., 'Standard VAT', 'Food Zero-Rated'

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    rate: number; // e.g., 8.00 for 8%

    @Column({
        type: 'enum',
        enum: ['inclusive', 'exclusive'],
        default: 'exclusive',
    })
    type: 'inclusive' | 'exclusive';

    @Column({ name: 'is_default', default: false })
    isDefault: boolean;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active',
    })
    status: 'active' | 'inactive';

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;
}
