import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('prompts')
export class Prompt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 20 })
  type: 'suggestion' | 'final';

  @Column({ type: 'boolean', default: true })
  is_personal: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  langfuse_id?: string;

  @Column({ type: 'uuid', nullable: true })
  forked_from_id?: string;

  @Column({ type: 'boolean', default: false })
  is_starred: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations (using string references to avoid circular dependencies)
  @ManyToOne('User', 'prompts', { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: any;

  @ManyToOne('Prompt', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'forked_from_id' })
  forked_from?: any;
}
