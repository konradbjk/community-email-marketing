import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('response_styles')
export class ResponseStyle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  system_prompt?: string;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
