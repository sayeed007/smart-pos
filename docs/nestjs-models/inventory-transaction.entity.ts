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
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Location } from './location.entity';
import { User } from './user.entity';

export enum InventoryTransactionType {
    IN = 'IN',
    OUT = 'OUT',
    ADJUST = 'ADJUST',
    TRANSFER_IN = 'TRANSFER_IN',
    TRANSFER_OUT = 'TRANSFER_OUT',
    RETURN = 'RETURN',
    SALE = 'SALE',
}

@Entity('inventory_transactions')
@Index(['tenantId', 'productId', 'locationId', 'createdAt'])
@Index(['tenantId', 'locationId', 'type'])
@Index(['referenceType', 'referenceId'])
export class InventoryTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;

    @Column({ name: 'variant_id', type: 'uuid', nullable: true })
    variantId: string;

    @Column({ name: 'location_id', type: 'uuid' })
    locationId: string;

    @Column({
        type: 'enum',
        enum: InventoryTransactionType,
    })
    type: InventoryTransactionType;

    @Column({ type: 'decimal', precision: 12, scale: 3 })
    quantity: number; // Positive for additions, negative for deductions

    @Column({ type: 'text' })
    reason: string;

    @Column({ name: 'reference_type', length: 50, nullable: true })
    referenceType: string; // 'sale', 'return', 'transfer', 'purchase_order'

    @Column({ name: 'reference_id', type: 'uuid', nullable: true })
    referenceId: string;

    @Column({ name: 'cost_at_time', type: 'decimal', precision: 12, scale: 2, nullable: true })
    costAtTime: number; // Snapshot of cost price at transaction time

    @Column({ name: 'performed_by', type: 'uuid' })
    performedBy: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'variant_id' })
    variant: ProductVariant;

    @ManyToOne(() => Location, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'location_id' })
    location: Location;

    @ManyToOne(() => User, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'performed_by' })
    performer: User;
}
