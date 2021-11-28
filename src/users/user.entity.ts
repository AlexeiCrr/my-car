import { Exclude } from 'class-transformer';
import { Report } from 'src/reports/report.entity';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  admin: boolean;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @AfterInsert()
  logInsert() {
    console.log('User entity inserted with id', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('User entity updated with id', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('User entity removed with id', this.id);
  }
}
