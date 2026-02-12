import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Location } from './location.entity';
import { User } from './user.entity';
import { StockTransferLine } from './stock-transfer-line.entity';

@Entity('stock_transfers')
export class StockTransfer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'from_location_id', type: 'uuid' })
    fromLocationId: string;

    @Column({ name: 'to_location_id', type: 'uuid' })
    toLocationId: string;

    @Column({
        type: 'enum',
        enum: ['draft', 'pending', 'shipped', 'received', 'cancelled'],
        default: 'draft',
    })
    status: 'draft' | 'pending' | 'shipped' | 'received' | 'cancelled';

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'shipped_by', type: 'uuid', nullable: true })
    shippedBy: string;

    @Column({ name: 'received_by', type: 'uuid', nullable: true })
    receivedBy: string;

    @Column({ name: 'shipped_at', type: 'timestamptz', nullable: true })
    shippedAt: Date;

    @Column({ name: 'received_at', type: 'timestamptz', nullable: true })
    receivedAt: Date;

    @Column({ name: 'created_by', type: 'uuid' })
    createdByUserId: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Location)
    @JoinColumn({ name: 'from_location_id' })
    fromLocation: Location;

    @ManyToOne(() => Location)
    @JoinColumn({ name: 'to_location_id' })
    toLocation: Location;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'shipped_by' })
    shipper: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'received_by' })
    receiver: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    createdByUser: User;

    @OneToMany(() => StockTransferLine, (line) => line.transfer, { cascade: true })
    lines: StockTransferLine[];
}
