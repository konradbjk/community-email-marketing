import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  custom_instructions?: string;

  @Column({ type: 'boolean', default: false })
  is_starred: boolean;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations (using string references to avoid circular dependencies)
  @ManyToOne('User', 'projects', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @OneToMany('Conversation', 'project')
  conversations: any[];
}
