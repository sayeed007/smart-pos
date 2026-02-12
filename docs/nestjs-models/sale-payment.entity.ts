import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

@Entity('sale_payments')
export class SalePayment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'sale_id', type: 'uuid' })
    saleId: string;

    @Column({
        type: 'enum',
        enum: ['cash', 'card', 'digital_wallet', 'gift_card', 'loyalty', 'other'],
    })
    method: 'cash' | 'card' | 'digital_wallet' | 'gift_card' | 'loyalty' | 'other';

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ length: 255, nullable: true })
    reference: string; // Card last 4, transaction ref, etc.

    @Column({ name: 'change_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
    changeAmount: number; // For cash overpayment

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Sale, (sale) => sale.payments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;
}
