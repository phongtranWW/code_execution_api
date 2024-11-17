import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  hash: string;

  @Column()
  salt: string;

  @UpdateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
