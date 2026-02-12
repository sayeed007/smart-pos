import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { CashShift } from './cash-shift.entity';
import { User } from './user.entity';

@Entity('cash_transactions')
export class CashTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'shift_id', type: 'uuid' })
    shiftId: string;

    @Column({
        type: 'enum',
        enum: ['sale', 'refund', 'pay_in', 'pay_out'],
    })
    type: 'sale' | 'refund' | 'pay_in' | 'pay_out';

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @Column({ name: 'reference_id', type: 'uuid', nullable: true })
    referenceId: string; // FK to sale/return

    @Column({ name: 'performed_by', type: 'uuid' })
    performedBy: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => CashShift, (shift) => shift.transactions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'shift_id' })
    shift: CashShift;

    @ManyToOne(() => User, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'performed_by' })
    performer: User;
}
