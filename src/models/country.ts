import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany, PrimaryColumn } from 'typeorm';
import { Disaster } from './disaster';

@Entity('countries')
export class Country {

  @PrimaryGeneratedColumn()
  fid?: number;

  @Column({ name: 'adm0_code' })
  adm0Code?: string; 

  @Column()
  name?: string; 

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'MultiPolygon', 
    srid: 4326,
  })
  geom: any;

  @OneToMany(() => Disaster, (disaster) => disaster.country)
  disasters?: Disaster[];
}