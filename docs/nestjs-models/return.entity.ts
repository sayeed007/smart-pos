import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Location } from './location.entity';
import { Sale } from './sale.entity';
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { ReturnLine } from './return-line.entity';

@Entity('returns')
export class Return {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'location_id', type: 'uuid' })
    locationId: string;

    @Column({ name: 'sale_id', type: 'uuid' })
    saleId: string;

    @Column({ name: 'invoice_no', length: 50 })
    invoiceNo: string;

    @Column({ name: 'customer_id', type: 'uuid', nullable: true })
    customerId: string;

    @Column({ name: 'refund_total', type: 'decimal', precision: 12, scale: 2 })
    refundTotal: number;

    @Column({ type: 'text' })
    reason: string;

    @Column({
        type: 'enum',
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending',
    })
    status: 'pending' | 'approved' | 'rejected' | 'completed';

    @Column({ name: 'processed_by', type: 'uuid' })
    processedBy: string;

    @Column({ name: 'approved_by', type: 'uuid', nullable: true })
    approvedBy: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
    completedAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Location, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'location_id' })
    location: Location;

    @ManyToOne(() => Sale, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;

    @ManyToOne(() => Customer, { nullable: true })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @ManyToOne(() => User, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'processed_by' })
    processor: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approved_by' })
    approver: User;

    @OneToMany(() => ReturnLine, (line) => line.returnEntity, { cascade: true, eager: true })
    lines: ReturnLine[];
}
