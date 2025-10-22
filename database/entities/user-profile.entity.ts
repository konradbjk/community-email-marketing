import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  role?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  department?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region?: string;

  @Column({ type: 'text', nullable: true })
  role_description?: string;

  @Column({ type: 'uuid', nullable: true })
  ai_response_style_id?: string;

  @Column({ type: 'text', nullable: true })
  custom_response_style?: string;

  @Column({ type: 'text', nullable: true })
  custom_instructions?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relations (using string references to avoid circular dependencies)
  @OneToOne('User', 'profile', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('ResponseStyle', { nullable: true })
  @JoinColumn({ name: 'ai_response_style_id' })
  response_style?: any;
}
