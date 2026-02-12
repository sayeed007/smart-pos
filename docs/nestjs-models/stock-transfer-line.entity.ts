import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { StockTransfer } from './stock-transfer.entity';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('stock_transfer_lines')
export class StockTransferLine {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'transfer_id', type: 'uuid' })
    transferId: string;

    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;

    @Column({ name: 'variant_id', type: 'uuid', nullable: true })
    variantId: string;

    @Column({ type: 'decimal', precision: 12, scale: 3 })
    quantity: number;

    @Column({ name: 'received_quantity', type: 'decimal', precision: 12, scale: 3, nullable: true })
    receivedQuantity: number; // For partial receives

    // Relations
    @ManyToOne(() => StockTransfer, (transfer) => transfer.lines, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'transfer_id' })
    transfer: StockTransfer;

    @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'variant_id' })
    variant: ProductVariant;
}
