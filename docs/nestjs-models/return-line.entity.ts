import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Return } from './return.entity';
import { SaleLine } from './sale-line.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('return_lines')
export class ReturnLine {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'return_id', type: 'uuid' })
    returnId: string;

    @Column({ name: 'sale_line_id', type: 'uuid' })
    saleLineId: string;

    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;

    @Column({ name: 'variant_id', type: 'uuid', nullable: true })
    variantId: string;

    @Column({ type: 'decimal', precision: 12, scale: 3 })
    quantity: number;

    @Column({ name: 'refund_amount', type: 'decimal', precision: 12, scale: 2 })
    refundAmount: number;

    @Column({ default: true })
    restock: boolean; // Should we put it back in inventory?

    // Relations
    @ManyToOne(() => Return, (ret) => ret.lines, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'return_id' })
    returnEntity: Return;

    @ManyToOne(() => SaleLine, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'sale_line_id' })
    saleLine: SaleLine;

    @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'variant_id' })
    variant: ProductVariant;
}
