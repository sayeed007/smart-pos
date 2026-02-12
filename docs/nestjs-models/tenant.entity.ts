import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Location } from './location.entity';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    name: string;

    @Column({ length: 100, unique: true })
    slug: string;

    @Column({ name: 'logo_url', type: 'text', nullable: true })
    logoUrl: string;

    @Column({ name: 'favicon_url', type: 'text', nullable: true })
    faviconUrl: string;

    @Column({ length: 255, nullable: true })
    tagline: string;

    @Column({ name: 'contact_email', length: 255, nullable: true })
    contactEmail: string;

    @Column({ name: 'contact_phone', length: 50, nullable: true })
    contactPhone: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ length: 3, default: 'USD' })
    currency: string;

    @Column({ length: 50, default: 'UTC' })
    timezone: string;

    @Column({ type: 'jsonb', default: '{}' })
    features: Record<string, boolean>;

    @Column({ name: 'subscription_plan', length: 50, default: 'free' })
    subscriptionPlan: string;

    @Column({
        name: 'subscription_status',
        type: 'enum',
        enum: ['active', 'inactive', 'trial', 'cancelled'],
        default: 'active',
    })
    subscriptionStatus: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    // Relations
    @OneToMany(() => Location, (location) => location.tenant)
    locations: Location[];

    @OneToMany(() => User, (user) => user.tenant)
    users: User[];

    @OneToMany(() => Role, (role) => role.tenant)
    roles: Role[];
}
