import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100, unique: true })
    code: string; // e.g., 'sale.create', 'product.delete', 'refund.approve'

    @Column({ length: 255 })
    name: string;

    @Column({ length: 50 })
    module: string; // e.g., 'pos', 'inventory', 'admin', 'reports'

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];
}
