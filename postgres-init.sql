-- Merck Chatbot Database Initialization Script
-- This script creates the schema and seeds initial data for development/POC

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SCHEMA CREATION
-- ============================================================================

-- Users table (from SSO)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merck_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    image VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User profiles (editable preferences)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(255),
    department VARCHAR(255),
    region VARCHAR(100),
    role_description TEXT,
    ai_response_style_id UUID,
    custom_response_style TEXT,
    custom_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Response styles
CREATE TABLE IF NOT EXISTS response_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(100) NOT NULL,
    description TEXT,
    system_prompt TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    custom_instructions TEXT,
    is_starred BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    is_starred BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages (Custom format - see types/messages.ts)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    tool_invocations JSONB,
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompts
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('suggestion', 'final')),
    is_personal BOOLEAN DEFAULT TRUE,
    langfuse_id VARCHAR(255),
    forked_from_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
    is_starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_merck_id ON users(merck_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);

-- ============================================================================
-- SEED DATA (REMOVED - Database will be empty on initialization)
-- ============================================================================

-- Seed data has been removed. The database will initialize with schema only.
-- Users will be created automatically on first login via Auth.js.

-- Single user for simplified seed data
INSERT INTO users (id, merck_id, name, surname, email, image) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'm277098', 'Alex', 'Johnson', 'alex.johnson@merck.com', 'https://avatar.iran.liara.run/public/43')
ON CONFLICT (merck_id) DO NOTHING;

-- Insert response styles
INSERT INTO response_styles (id, label, description, system_prompt, is_default) VALUES
    ('550e8400-e29b-41d4-a716-446655440100', 'Normal', 'Balanced responses with detailed explanations', 'Provide comprehensive, balanced responses with clear explanations. Use the custom instructions provided by the user.', TRUE),
    ('550e8400-e29b-41d4-a716-446655440101', 'Concise', 'Brief, to-the-point responses', 'Keep responses concise and focused. Get straight to the point without unnecessary elaboration.', FALSE),
    ('550e8400-e29b-41d4-a716-446655440102', 'Learning', 'Educational responses with context', 'Provide responses that teach and explain concepts. Include background information and step-by-step reasoning.', FALSE),
    ('550e8400-e29b-41d4-a716-446655440103', 'Formal', 'Professional business communication', 'Use formal business language. Maintain professional tone suitable for executive communication.', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insert user profile for Alex Johnson
INSERT INTO user_profiles (user_id, role, department, region, role_description, ai_response_style_id, custom_instructions) VALUES
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Senior Marketing Manager',
        'Oncology Business Unit',
        'EMEA',
        'I lead marketing analytics for the Oncology portfolio, focusing on digital channel optimization and customer segmentation strategies.',
        '550e8400-e29b-41d4-a716-446655440100',
        'When analyzing data, please focus on actionable insights and include benchmarks against regional averages. I prefer visual representations when discussing trends.'
    )
ON CONFLICT (user_id) DO NOTHING;

-- Insert projects for Alex Johnson with custom instructions
INSERT INTO projects (id, user_id, name, display_name, description, custom_instructions, is_starred) VALUES
    (
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '550e8400-e29b-41d4-a716-446655440000',
        'omnichannel-analytics',
        'Omnichannel Analytics Dashboard',
        'Track field vs digital interaction ratios, channel performance, and customer engagement across all touchpoints',
        'Always include field vs digital ratio comparisons. Focus on EMEA regions (Germany, France, UK, Italy, Spain). Benchmark against 65% digital target. Highlight trends in face-to-face interaction quality scores.',
        TRUE
    ),
    (
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '550e8400-e29b-41d4-a716-446655440000',
        'email-performance-insights',
        'Email Performance Insights',
        'Analyze email open rates by content type (Commercial, Medical, Promotional, Event) across regions and customer segments',
        'Break down metrics by content type: Commercial, Medical, Promotional, Event. Compare open rates against industry benchmarks (Medical: 24%, Commercial: 18%). Segment by HCP specialty and engagement tier.',
        FALSE
    ),
    (
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        '550e8400-e29b-41d4-a716-446655440000',
        'customer-segmentation',
        'Customer Segmentation Analysis',
        'Economic and behavioral segmentation analysis, HCP opt-in tracking, and segment performance evaluation',
        'Focus on premium vs value segment analysis. Track opt-in rates by segment. Analyze engagement patterns across economic tiers. Provide recommendations for segment-specific strategies.',
        TRUE
    )
ON CONFLICT (id) DO NOTHING;

-- Insert 12 conversations for Alex Johnson spread over 6 months (4 archived)
INSERT INTO conversations (id, user_id, project_id, title, is_starred, is_archived, updated_at) VALUES
    -- Last week (2 conversations)
    (
        '550e8400-e29b-41d4-a716-446655440200',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        'Email Open Rates by Content Type',
        TRUE,
        FALSE,
        NOW() - INTERVAL '2 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'Q1 2025 Omnichannel Performance',
        TRUE,
        FALSE,
        NOW() - INTERVAL '5 days'
    ),
    -- 1 month ago (2 conversations)
    (
        '550e8400-e29b-41d4-a716-446655440202',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'HCP Engagement Trends December',
        FALSE,
        FALSE,
        NOW() - INTERVAL '28 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440203',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        'Premium Segment Deep Dive',
        TRUE,
        FALSE,
        NOW() - INTERVAL '35 days'
    ),
    -- 2 months ago (2 conversations, 1 archived)
    (
        '550e8400-e29b-41d4-a716-446655440204',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Channel Mix Analysis November',
        FALSE,
        FALSE,
        NOW() - INTERVAL '58 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440205',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Regional Benchmarking Study',
        FALSE,
        TRUE,
        NOW() - INTERVAL '65 days'
    ),
    -- 3 months ago (2 conversations, 1 archived)
    (
        '550e8400-e29b-41d4-a716-446655440206',
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'Digital Adoption Rate Analysis',
        FALSE,
        FALSE,
        NOW() - INTERVAL '88 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440207',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Q3 Performance Review',
        FALSE,
        TRUE,
        NOW() - INTERVAL '95 days'
    ),
    -- 4 months ago (2 conversations, 1 archived)
    (
        '550e8400-e29b-41d4-a716-446655440208',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Face-to-Face Effectiveness Study',
        FALSE,
        FALSE,
        NOW() - INTERVAL '118 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440209',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        'Email Campaign Strategy 2024',
        FALSE,
        TRUE,
        NOW() - INTERVAL '125 days'
    ),
    -- 5-6 months ago (2 conversations, 1 archived)
    (
        '550e8400-e29b-41d4-a716-446655440210',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Customer Journey Mapping',
        FALSE,
        FALSE,
        NOW() - INTERVAL '155 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440211',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        'Segmentation Model Review H1 2024',
        FALSE,
        TRUE,
        NOW() - INTERVAL '175 days'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample messages (using TEXT IDs for custom backend compatibility)
-- Conversation 1: Email Open Rates
INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES
    ('msg_200_001', '550e8400-e29b-41d4-a716-446655440200', 'user', 'Can you analyze our email open rates across different content types for Q4?', NOW() - INTERVAL '2 days'),
    ('msg_200_002', '550e8400-e29b-41d4-a716-446655440200', 'assistant', 'Based on the Q4 analysis, medical emails achieve 24% open rates compared to 18% for promotional content across all EMEA regions. Event-based emails show 21% open rates, while commercial messages sit at 16%. This 6-8 point difference is consistent with industry benchmarks for healthcare communications.', NOW() - INTERVAL '2 days'),
    ('msg_200_003', '550e8400-e29b-41d4-a716-446655440200', 'user', 'How do these rates compare by country?', NOW() - INTERVAL '2 days'),
    ('msg_200_004', '550e8400-e29b-41d4-a716-446655440200', 'assistant', 'Germany leads with 26% average open rate, followed by France at 23% and UK at 22%. Spain and Italy show slightly lower rates at 19% and 20% respectively. The variance is primarily driven by medical content performance.', NOW() - INTERVAL '2 days');

-- Conversation 2: Omnichannel Performance
INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES
    ('msg_201_001', '550e8400-e29b-41d4-a716-446655440201', 'user', 'Show me the Q1 omnichannel performance trends', NOW() - INTERVAL '5 days'),
    ('msg_201_002', '550e8400-e29b-41d4-a716-446655440201', 'assistant', 'Q1 shows digital interactions at 67%, exceeding our 65% target. Face-to-face quality scores remain strong at 4.2/5.0. Field execution rate is 78%, up 3 points from Q4. The omnichannel mix is well-balanced with no quality degradation.', NOW() - INTERVAL '5 days');

-- Conversation 3: HCP Engagement
INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES
    ('msg_202_001', '550e8400-e29b-41d4-a716-446655440202', 'user', 'What were the key HCP engagement trends in December?', NOW() - INTERVAL '28 days'),
    ('msg_202_002', '550e8400-e29b-41d4-a716-446655440202', 'assistant', 'December showed 72% overall HCP engagement, with oncologists leading at 78%. Engagement dropped slightly during holiday weeks (Dec 18-31) to 65%, which is expected seasonally. Digital touchpoints increased 15% compared to November, compensating for reduced face-to-face availability.', NOW() - INTERVAL '28 days');

-- Conversation 4: Premium Segment (in project)
INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES
    ('msg_203_001', '550e8400-e29b-41d4-a716-446655440203', 'user', 'Analyze the premium segment engagement and behavior patterns', NOW() - INTERVAL '35 days'),
    ('msg_203_002', '550e8400-e29b-41d4-a716-446655440203', 'assistant', 'Premium segment shows 68% engagement rate with strong preference for medical content (82% open rate). Average interaction frequency is 2.3 times per week. This segment responds particularly well to face-to-face meetings (quality score 4.5/5.0) combined with medical email follow-ups. Opt-in rate for premium segment is 91%, significantly higher than value segment at 62%.', NOW() - INTERVAL '35 days'),
    ('msg_203_003', '550e8400-e29b-41d4-a716-446655440203', 'user', 'What channels work best for this segment?', NOW() - INTERVAL '35 days'),
    ('msg_203_004', '550e8400-e29b-41d4-a716-446655440203', 'assistant', 'Premium segment engagement is highest through: 1) Face-to-face meetings (85% engagement), 2) Medical emails (82%), 3) Webinars (78%). Commercial and promotional channels show lower engagement at 45-50%. Recommend focusing on medical content and in-person interactions for this segment.', NOW() - INTERVAL '35 days');

-- Insert personal prompts for Alex Johnson
INSERT INTO prompts (user_id, title, content, type, is_personal, is_starred) VALUES
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Email Campaign Analysis',
        'Analyze email campaign performance focusing on: 1) Open rates by content type (Medical, Commercial, Promotional, Event), 2) Regional variations across EMEA, 3) Time-based trends, 4) Benchmark comparisons against industry standards. Provide actionable recommendations for improvement.',
        'final',
        TRUE,
        TRUE
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Quick Metrics Summary',
        'Provide a concise summary of key performance metrics with bullet points',
        'suggestion',
        TRUE,
        FALSE
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Channel Performance Deep Dive',
        'Analyze channel performance including: field vs digital ratios, interaction quality scores, cost per interaction, and engagement trends. Include regional benchmarks across Germany, France, UK, Italy, and Spain. Compare against 65% digital target.',
        'final',
        TRUE,
        FALSE
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Segmentation Analysis Template',
        'Analyze customer segment performance including: premium vs value segment engagement, opt-in rates by segment, channel preferences, and interaction frequency. Provide segment-specific strategy recommendations.',
        'final',
        TRUE,
        TRUE
    )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Output summary of seeded data
DO $$
DECLARE
    user_count INT;
    project_count INT;
    conversation_count INT;
    message_count INT;
    prompt_count INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO project_count FROM projects;
    SELECT COUNT(*) INTO conversation_count FROM conversations;
    SELECT COUNT(*) INTO message_count FROM messages;
    SELECT COUNT(*) INTO prompt_count FROM prompts;

    RAISE NOTICE '=== Database Initialization Complete ===';
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE 'Projects: %', project_count;
    RAISE NOTICE 'Conversations: %', conversation_count;
    RAISE NOTICE 'Messages: %', message_count;
    RAISE NOTICE 'Prompts: %', prompt_count;
    RAISE NOTICE '======================================';
END $$;
