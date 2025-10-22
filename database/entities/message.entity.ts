import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'uuid' })
  conversation_id: string;

  @Column({ type: 'varchar', length: 20 })
  role: 'user' | 'assistant' | 'system' | 'tool';

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  tool_invocations: any;

  @Column({ type: 'jsonb', nullable: true })
  attachments: any;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relations (using string references to avoid circular dependencies)
  @ManyToOne('Conversation', 'messages', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: any;
}
