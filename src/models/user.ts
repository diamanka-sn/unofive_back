import {
  Entity,
  Column,
  BaseEntity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
} from "typeorm";
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id?: number;

  @Column()
  nom!: string;

  @Column()
  password!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  imageUrl?:string;

  @Column({ name: "isAdmin", default: false })
  isAdmin!: boolean;

  @CreateDateColumn({ name: "createdAt" })
  createdAt!: Date;

  toJSON() {
    const { password, ...rest } = this;
    return rest;
  }
}