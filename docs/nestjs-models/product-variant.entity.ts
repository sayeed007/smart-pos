import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Product } from './product.entity';
import { ProductBarcode } from './product-barcode.entity';

@Entity('product_variants')
@Index(['tenantId', 'sku'], { unique: true })
@Index(['productId', 'status'])
export class ProductVariant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;

    @Column({ length: 100 })
    sku: string;

    @Column({ length: 255 })
    name: string; // e.g., 'Large / Red'

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    price: number;

    @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
    costPrice: number;

    @Column({ type: 'jsonb' })
    attributes: Record<string, string>; // {"Size": "L", "Color": "Red"}

    @Column({ name: 'image_url', type: 'text', nullable: true })
    imageUrl: string;

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

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @OneToMany(() => ProductBarcode, (barcode) => barcode.variant)
    barcodes: ProductBarcode[];
}
