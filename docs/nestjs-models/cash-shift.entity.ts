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
import { Register } from './register.entity';
import { User } from './user.entity';
import { CashTransaction } from './cash-transaction.entity';

@Entity('cash_shifts')
export class CashShift {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'location_id', type: 'uuid' })
    locationId: string;

    @Column({ name: 'register_id', type: 'uuid', nullable: true })
    registerId: string;

    @Column({ name: 'cashier_id', type: 'uuid' })
    cashierId: string;

    @Column({ name: 'start_time', type: 'timestamptz' })
    startTime: Date;

    @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
    endTime: Date;

    @Column({ name: 'start_amount', type: 'decimal', precision: 12, scale: 2 })
    startAmount: number; // Opening float

    @Column({ name: 'end_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
    endAmount: number; // Counted amount

    @Column({ name: 'expected_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
    expectedAmount: number; // System-calculated

    @Column({
        type: 'enum',
        enum: ['open', 'closed'],
        default: 'open',
    })
    status: 'open' | 'closed';

    @Column({ type: 'text', nullable: true })
    notes: string;

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

    @ManyToOne(() => User, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'cashier_id' })
    cashier: User;

    @OneToMany(() => CashTransaction, (tx) => tx.shift)
    transactions: CashTransaction[];
}
