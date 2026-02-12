import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { Offer } from './offer.entity';

@Entity('sale_lines')
export class SaleLine {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'sale_id', type: 'uuid' })
    saleId: string;

    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;

    @Column({ name: 'variant_id', type: 'uuid', nullable: true })
    variantId: string;

    // === Snapshot Fields (frozen at sale time) ===
    @Column({ length: 100 })
    sku: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'decimal', precision: 12, scale: 3 })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
    unitPrice: number; // Price at time of sale

    @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2 })
    costPrice: number; // Cost at time of sale (for margin calc)

    @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2 })
    taxRate: number;

    @Column({
        name: 'tax_type',
        type: 'enum',
        enum: ['inclusive', 'exclusive'],
        default: 'exclusive',
    })
    taxType: 'inclusive' | 'exclusive';

    @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2 })
    taxAmount: number;

    @Column({ name: 'line_total', type: 'decimal', precision: 12, scale: 2 })
    lineTotal: number; // (unit_price * qty) - discount + tax

    @Column({ name: 'offer_id', type: 'uuid', nullable: true })
    offerId: string;

    // Relations
    @ManyToOne(() => Sale, (sale) => sale.lines, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;

    @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'variant_id' })
    variant: ProductVariant;

    @ManyToOne(() => Offer, { nullable: true })
    @JoinColumn({ name: 'offer_id' })
    offer: Offer;
}
