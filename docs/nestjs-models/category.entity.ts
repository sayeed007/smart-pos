import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('categories')
@Index(['tenantId', 'status'])
@Index(['tenantId', 'parentId'])
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ length: 255 })
    name: string;

    @Column({ name: 'parent_id', type: 'uuid', nullable: true })
    parentId: string;

    @Column({ length: 50, nullable: true })
    icon: string;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active',
    })
    status: 'active' | 'inactive';

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Category, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent: Category;
}
