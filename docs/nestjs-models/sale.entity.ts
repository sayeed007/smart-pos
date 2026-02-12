import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Location } from './location.entity';
import { Register } from './register.entity';
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { CashShift } from './cash-shift.entity';
import { SaleLine } from './sale-line.entity';
import { SalePayment } from './sale-payment.entity';

@Entity('sales')
@Index(['tenantId', 'invoiceNo'], { unique: true })
@Index(['tenantId', 'offlineId'], { unique: true, where: '"offline_id" IS NOT NULL' })
@Index(['tenantId', 'locationId', 'completedAt'])
@Index(['tenantId', 'customerId'])
@Index(['tenantId', 'cashierId', 'completedAt'])
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'location_id', type: 'uuid' })
    locationId: string;

    @Column({ name: 'register_id', type: 'uuid', nullable: true })
    registerId: string;

    @Column({ name: 'invoice_no', length: 50 })
    invoiceNo: string;

    @Column({ name: 'customer_id', type: 'uuid', nullable: true })
    customerId: string;

    @Column({ name: 'cashier_id', type: 'uuid' })
    cashierId: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    subtotal: number;

    @Column({ name: 'discount_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
    discountTotal: number;

    @Column({ name: 'tax_total', type: 'decimal', precision: 12, scale: 2, default: 0 })
    taxTotal: number;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    total: number;

    @Column({ name: 'loyalty_points_earned', type: 'int', default: 0 })
    loyaltyPointsEarned: number;

    @Column({ name: 'loyalty_points_redeemed', type: 'int', default: 0 })
    loyaltyPointsRedeemed: number;

    @Column({ name: 'loyalty_discount', type: 'decimal', precision: 12, scale: 2, default: 0 })
    loyaltyDiscount: number;

    @Column({
        type: 'enum',
        enum: ['completed', 'voided', 'returned', 'partially_returned'],
        default: 'completed',
    })
    status: 'completed' | 'voided' | 'returned' | 'partially_returned';

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'shift_id', type: 'uuid', nullable: true })
    shiftId: string;

    @Column({ name: 'is_offline', default: false })
    isOffline: boolean;

    @Column({ name: 'offline_id', type: 'uuid', nullable: true })
    offlineId: string; // Client-generated UUID for dedup

    @Column({ name: 'completed_at', type: 'timestamptz' })
    completedAt: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Location, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'location_id' })
    location: Location;

    @ManyToOne(() => Register, { nullable: true })
    @JoinColumn({ name: 'register_id' })
    register: Register;

    @ManyToOne(() => Customer, { nullable: true })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => User, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'cashier_id' })
    cashier: User;

    @ManyToOne(() => CashShift, { nullable: true })
    @JoinColumn({ name: 'shift_id' })
    shift: CashShift;

    @OneToMany(() => SaleLine, (line) => line.sale, { cascade: true, eager: true })
    lines: SaleLine[];

    @OneToMany(() => SalePayment, (payment) => payment.sale, { cascade: true, eager: true })
    payments: SalePayment[];
}
