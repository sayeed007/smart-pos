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

@Entity('product_barcodes')
@Index(['tenantId', 'barcode'], { unique: true })
export class ProductBarcode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;

    @Column({ name: 'variant_id', type: 'uuid', nullable: true })
    variantId: string;

    @Column({ length: 255 })
    barcode: string;

    @Column({
        type: 'enum',
        enum: ['ean13', 'upc', 'code128', 'custom', 'embedded_weight'],
        default: 'custom',
    })
    type: string;

    @Column({ name: 'is_primary', default: false })
    isPrimary: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Product, (product) => product.barcodes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => ProductVariant, (variant) => variant.barcodes, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'variant_id' })
    variant: ProductVariant;
}
