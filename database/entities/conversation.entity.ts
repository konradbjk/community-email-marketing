import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  project_id?: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'boolean', default: false })
  is_starred: boolean;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations (using string references to avoid circular dependencies)
  @ManyToOne('User', 'conversations', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Project', 'conversations', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_id' })
  project?: any;

  @OneToMany('Message', 'conversation', { cascade: true })
  messages: any[];
}
