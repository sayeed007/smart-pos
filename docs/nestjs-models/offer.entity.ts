import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Category } from './category.entity';
import { User } from './user.entity';

@Entity('offers')
export class Offer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ['percentage', 'fixed', 'buy_x_get_y', 'bundle', 'category_discount'],
    })
    type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'bundle' | 'category_discount';

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    value: number;

    @Column({ name: 'min_purchase', type: 'decimal', precision: 12, scale: 2, nullable: true })
    minPurchase: number;

    @Column({ name: 'max_discount', type: 'decimal', precision: 12, scale: 2, nullable: true })
    maxDiscount: number;

    @Column({
        name: 'applicable_on',
        type: 'enum',
        enum: ['all', 'category', 'product'],
    })
    applicableOn: 'all' | 'category' | 'product';

    @Column({ name: 'category_id', type: 'uuid', nullable: true })
    categoryId: string;

    @Column({ name: 'product_ids', type: 'uuid', array: true, nullable: true })
    productIds: string[];

    @Column({ name: 'start_date', type: 'timestamptz' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'timestamptz' })
    endDate: Date;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive', 'scheduled'],
        default: 'active',
    })
    status: 'active' | 'inactive' | 'scheduled';

    @Column({ name: 'auto_apply', default: true })
    autoApply: boolean;

    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Category, { nullable: true })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    creator: User;
}
