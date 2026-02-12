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
import { PriceBook } from './price-book.entity';
import { Register } from './register.entity';

@Entity('locations')
export class Location {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({
        type: 'enum',
        enum: ['store', 'warehouse'],
    })
    type: 'store' | 'warehouse';

    @Column({ length: 50, nullable: true })
    phone: string;

    @Column({ name: 'price_book_id', type: 'uuid', nullable: true })
    priceBookId: string;

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
    @ManyToOne(() => Tenant, (tenant) => tenant.locations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => PriceBook, { nullable: true })
    @JoinColumn({ name: 'price_book_id' })
    priceBook: PriceBook;

    @OneToMany(() => Register, (register) => register.location)
    registers: Register[];
}
