import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Country } from './country';

@Entity('disasters')
export class Disaster {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  @Index()
  disno?: string;

  @Column()
  year?: number;

  @Column({ length: 3 })
  @Index()
  iso?: string;

  @Column()
  group?: string;

  @Column()
  subgroup?: string;

  @Column()
  disaster_type?: string;

  @Column({ nullable: true })
  disaster_subtype?: string;

  @Column({ type: 'float', default: 0 })
  deaths?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  damage_usd?: number;

  @Column({ type: 'float', default: 0 })
  injured?: number;

  @Column({ type: 'float', default: 0 })
  affected?: number;

  @Column({ type: 'float', default: 0 })
  homeless?: number;

  @Column({ type: 'float', default: 0 })
  total_affected?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, default: 0 })
  cpi?: number;

  @Column({ type: 'date', nullable: true })
  entry_date?: string;

  @Column({ type: 'date', nullable: true })
  last_update?: string;

  @Column({ type: 'date', nullable: true })
  @Index()
  start_date?: string;

  @Column({ type: 'date', nullable: true })
  end_date?: string;

  @Column()
  fid?: number; // Clé de jointure avec ta table pays (SIG)



  @ManyToOne(() => Country, (country) => country.disasters)
  @JoinColumn({ name: 'fid', referencedColumnName: 'fid' })
  country?: Country;
}