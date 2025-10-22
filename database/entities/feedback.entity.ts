import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  message_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 20 })
  rating: 'positive' | 'negative';

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relations (using string references to avoid circular dependencies)
  @ManyToOne('Message', 'feedback', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: any;

  @ManyToOne('User', 'feedback', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;
}
