import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { Location } from './location.entity';

@Entity('registers')
export class Register {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'tenant_id', type: 'uuid' })
    tenantId: string;

    @Column({ name: 'location_id', type: 'uuid' })
    locationId: string;

    @Column({ length: 100 })
    name: string;

    @Column({ name: 'device_id', length: 255, nullable: true })
    deviceId: string;

    @Column({
        type: 'enum',
        enum: ['active', 'inactive'],
        default: 'active',
    })
    status: 'active' | 'inactive';

    @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true })
    lastSeenAt: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;

    @ManyToOne(() => Location, (location) => location.registers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'location_id' })
    location: Location;
}
