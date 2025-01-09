import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Analytic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shortUrlId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  accessedAt: Date;

  @Column()
  ipAddress: string;
}