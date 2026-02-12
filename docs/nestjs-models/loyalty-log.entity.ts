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
import { Customer } from './customer.entity';
import { Sale } from './sale.entity';
import { User } from './user.entity';

@Entity('loyalty_logs')
@Index(['tenantId', 'customerId', 'createdAt'])
export class LoyaltyLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'customer_id', type: 'uuid' })
    customerId: string;

    @Column({ name: 'sale_id', type: 'uuid', nullable: true })
    saleId: string;

    @Column({
        type: 'enum',
        enum: ['earning', 'redemption', 'adjustment', 'expiry'],
    })
    type: 'earning' | 'redemption' | 'adjustment' | 'expiry';

    @Column({ type: 'int' })
    points: number; // Positive for earn, negative for burn

    @Column({ name: 'balance_after', type: 'int' })
    balanceAfter: number; // Running balance after this transaction

    @Column({ type: 'text', nullable: true })
    reason: string;

    @Column({ name: 'performed_by', type: 'uuid', nullable: true })
    performedBy: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Customer, (customer) => customer.loyaltyLogs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => Sale, { nullable: true })
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'performed_by' })
    performer: User;
}
