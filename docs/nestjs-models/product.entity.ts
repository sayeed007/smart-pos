import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Category } from './category.entity';
import { TaxProfile } from './tax-profile.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductBarcode } from './product-barcode.entity';
import { User } from './user.entity';

@Entity('products')
@Index(['tenantId', 'sku'], { unique: true, where: '"deleted_at" IS NULL' })
@Index(['tenantId', 'categoryId', 'status'])
@Index(['tenantId', 'name'])
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 100 })
    sku: string;

    @Column({
        type: 'enum',
        enum: ['simple', 'variable'],
        default: 'simple',
    })
    type: 'simple' | 'variable';

    @Column({ name: 'category_id', type: 'uuid', nullable: true })
    categoryId: string;

    @Column({ name: 'tax_profile_id', type: 'uuid', nullable: true })
    taxProfileId: string;

    @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
    costPrice: number;

    @Column({ name: 'selling_price', type: 'decimal', precision: 12, scale: 2 })
    sellingPrice: number;

    @Column({ length: 20, default: 'pcs' })
    uom: string; // pcs, kg, m, l, etc.

    @Column({ name: 'allow_decimals', default: false })
    allowDecimals: boolean;

    @Column({ name: 'min_stock_level', type: 'decimal', precision: 12, scale: 3, default: 0 })
    minStockLevel: number;

    @Column({ name: 'image_url', type: 'text', nullable: true })
    imageUrl: string;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive', 'draft'],
        default: 'active',
    })
    status: 'active' | 'inactive' | 'draft';

    @Column({ name: 'created_by', type: 'uuid', nullable: true })
    createdBy: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
    deletedAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Category, { nullable: true })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @ManyToOne(() => TaxProfile, { nullable: true })
    @JoinColumn({ name: 'tax_profile_id' })
    taxProfile: TaxProfile;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    creator: User;

    @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
    variants: ProductVariant[];

    @OneToMany(() => ProductBarcode, (barcode) => barcode.product, { cascade: true })
    barcodes: ProductBarcode[];
}
