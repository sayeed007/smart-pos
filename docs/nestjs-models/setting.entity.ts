import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Location } from './location.entity';

@Entity('settings')
@Index(['tenantId', 'locationId', 'key'], { unique: true })
export class Setting {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'location_id', type: 'uuid', nullable: true })
    locationId: string; // NULL = global tenant setting

    @Column({ length: 100 })
    key: string;

    @Column({ type: 'jsonb' })
    value: any;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Location, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'location_id' })
    location: Location;
}
