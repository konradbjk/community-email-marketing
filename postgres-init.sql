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

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating VARCHAR(20) NOT NULL CHECK (rating IN ('positive', 'negative')),
    category VARCHAR(100),
    details TEXT,
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
CREATE INDEX IF NOT EXISTS idx_feedback_message_id ON feedback(message_id);

-- ============================================================================
-- SEED DATA (REMOVED - Database will be empty on initialization)
-- ============================================================================

-- Seed data has been removed. The database will initialize with schema only.
-- Users will be created automatically on first login via Auth.js.

-- To manually add test data, use the API endpoints or insert directly via SQL.
INSERT INTO users (id, merck_id, name, surname, email, image) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'm277098', 'Alex', 'Johnson', 'alex.johnson@merck.com', 'https://avatar.iran.liara.run/public/43'),
    ('550e8400-e29b-41d4-a716-446655440001', 'm283456', 'Sarah', 'Chen', 'sarah.chen@merck.com', 'https://avatar.iran.liara.run/public/77'),
    ('550e8400-e29b-41d4-a716-446655440002', 'm291234', 'Michael', 'Rodriguez', 'michael.rodriguez@merck.com', 'https://avatar.iran.liara.run/public/32')
ON CONFLICT (merck_id) DO NOTHING;

-- Insert response styles
INSERT INTO response_styles (id, label, description, system_prompt, is_default) VALUES
    ('550e8400-e29b-41d4-a716-446655440100', 'Normal', 'Balanced responses with detailed explanations', 'Provide comprehensive, balanced responses with clear explanations. Use the custom instructions provided by the user.', TRUE),
    ('550e8400-e29b-41d4-a716-446655440101', 'Concise', 'Brief, to-the-point responses', 'Keep responses concise and focused. Get straight to the point without unnecessary elaboration.', FALSE),
    ('550e8400-e29b-41d4-a716-446655440102', 'Learning', 'Educational responses with context', 'Provide responses that teach and explain concepts. Include background information and step-by-step reasoning.', FALSE),
    ('550e8400-e29b-41d4-a716-446655440103', 'Formal', 'Professional business communication', 'Use formal business language. Maintain professional tone suitable for executive communication.', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insert user profiles for each user
INSERT INTO user_profiles (user_id, role, department, region, role_description, ai_response_style_id, custom_instructions) VALUES
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Senior Marketing Manager',
        'Oncology Business Unit',
        'EMEA',
        'I lead marketing analytics for the Oncology portfolio, focusing on digital channel optimization and customer segmentation strategies.',
        '550e8400-e29b-41d4-a716-446655440100',
        'When analyzing data, please focus on actionable insights and include benchmarks against regional averages. I prefer visual representations when discussing trends.'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440001',
        'Data Analytics Lead',
        'Commercial Excellence',
        'North America',
        'I specialize in customer engagement analytics and omnichannel strategy optimization.',
        '550e8400-e29b-41d4-a716-446655440101',
        'Keep responses data-driven and concise. Always include key metrics upfront.'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002',
        'Marketing Analyst',
        'Vaccines',
        'APAC',
        'I focus on campaign performance analysis and digital channel effectiveness.',
        '550e8400-e29b-41d4-a716-446655440102',
        'I appreciate detailed explanations that help me understand the methodology behind insights.'
    )
ON CONFLICT (user_id) DO NOTHING;

-- Insert projects (Alex Johnson's projects)
INSERT INTO projects (id, user_id, name, display_name, description, is_starred) VALUES
    (
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '550e8400-e29b-41d4-a716-446655440000',
        'omnichannel-analytics',
        'Omnichannel Analytics Dashboard',
        'Track field vs digital interaction ratios, channel performance, and customer engagement across all touchpoints',
        TRUE
    ),
    (
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '550e8400-e29b-41d4-a716-446655440000',
        'email-performance-insights',
        'Email Performance Insights',
        'Analyze email open rates by content type (Commercial, Medical, Promotional, Event) across regions and customer segments',
        FALSE
    ),
    (
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        '550e8400-e29b-41d4-a716-446655440000',
        'customer-segmentation-optimization',
        'Customer Segmentation Optimization',
        'Economic and behavioral segmentation analysis, HCP opt-in tracking, and segment performance evaluation',
        TRUE
    ),
    (
        '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
        '550e8400-e29b-41d4-a716-446655440001',
        'cross-regional-benchmarking',
        'Cross-Regional Benchmarking',
        'Compare channel execution, engagement rates, and marketing performance across countries and regions',
        FALSE
    ),
    (
        '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
        '550e8400-e29b-41d4-a716-446655440001',
        'digital-territory-mapping',
        'Digital Territory Mapping',
        'Identify territories with highest digital channel adoption and optimize digital engagement strategies',
        FALSE
    )
ON CONFLICT (id) DO NOTHING;

-- Insert conversations (Alex Johnson - 8 conversations, Sarah Chen - 3, Michael Rodriguez - 1)
INSERT INTO conversations (id, user_id, project_id, title, is_starred, is_archived, created_at) VALUES
    -- Alex Johnson's conversations
    (
        '550e8400-e29b-41d4-a716-446655440200',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        'Email Open Rates by Type Analysis',
        TRUE,
        FALSE,
        NOW() - INTERVAL '15 minutes'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Economic Segmentation Strategy Review',
        FALSE,
        FALSE,
        NOW() - INTERVAL '2 hours'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440202',
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'Omnichannel Mix Trends 2024',
        TRUE,
        FALSE,
        NOW() - INTERVAL '5 hours'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440203',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'HCP Opt-in Rates Q4 Analysis',
        FALSE,
        FALSE,
        NOW() - INTERVAL '1 day'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440204',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Behavioral Segmentation Evolution',
        TRUE,
        FALSE,
        NOW() - INTERVAL '2 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440205',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Channel X Performance by Country',
        FALSE,
        FALSE,
        NOW() - INTERVAL '5 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440206',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Face-to-Face vs Digital Trade-off',
        FALSE,
        TRUE,
        NOW() - INTERVAL '8 days'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440207',
        '550e8400-e29b-41d4-a716-446655440000',
        NULL,
        'Regional Channel Mix Comparison',
        FALSE,
        FALSE,
        NOW() - INTERVAL '12 days'
    ),
    -- Sarah Chen's conversations
    (
        '550e8400-e29b-41d4-a716-446655440208',
        '550e8400-e29b-41d4-a716-446655440001',
        '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
        'NA vs EMEA Engagement Comparison',
        TRUE,
        FALSE,
        NOW() - INTERVAL '3 hours'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440209',
        '550e8400-e29b-41d4-a716-446655440001',
        NULL,
        'Q4 Performance Dashboard Review',
        FALSE,
        FALSE,
        NOW() - INTERVAL '1 day'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440210',
        '550e8400-e29b-41d4-a716-446655440001',
        NULL,
        'Digital Adoption Metrics',
        FALSE,
        FALSE,
        NOW() - INTERVAL '4 days'
    ),
    -- Michael Rodriguez's conversation
    (
        '550e8400-e29b-41d4-a716-446655440211',
        '550e8400-e29b-41d4-a716-446655440002',
        NULL,
        'Vaccine Campaign Performance APAC',
        FALSE,
        FALSE,
        NOW() - INTERVAL '6 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert messages for conversations
-- Conversation 1: Email Open Rates (in project)
INSERT INTO messages (conversation_id, role, content, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440200', 'user', 'Can you analyze our email open rates across different content types?', NOW() - INTERVAL '15 minutes'),
    ('550e8400-e29b-41d4-a716-446655440200', 'assistant', 'Based on the analysis, medical emails achieve 24% open rates compared to 18% for promotional content across all EMEA regions. This 6-point difference is consistent with industry benchmarks for healthcare communications.', NOW() - INTERVAL '14 minutes');

-- Conversation 2: Economic Segmentation
INSERT INTO messages (conversation_id, role, content, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440201', 'user', 'What are the engagement differences between our premium and value segments?', NOW() - INTERVAL '2 hours'),
    ('550e8400-e29b-41d4-a716-446655440201', 'assistant', 'The premium segment shows 65% engagement versus 40% in the value segment. This 25-point gap suggests we should refine our value segment strategy to improve engagement.', NOW() - INTERVAL '2 hours');

-- Conversation 3: Omnichannel Mix (in project)
INSERT INTO messages (conversation_id, role, content, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440202', 'user', 'How have our digital vs face-to-face interactions changed in 2024?', NOW() - INTERVAL '5 hours'),
    ('550e8400-e29b-41d4-a716-446655440202', 'assistant', 'Digital interactions increased 32% in 2024 while maintaining face-to-face quality scores above 4.1. This indicates successful channel optimization without quality degradation.', NOW() - INTERVAL '5 hours'),
    ('550e8400-e29b-41d4-a716-446655440202', 'user', 'What are the regional variations in this trend?', NOW() - INTERVAL '4 hours'),
    ('550e8400-e29b-41d4-a716-446655440202', 'assistant', 'Germany leads with 89% execution rate, while home market shows 67%. The variance suggests different digital readiness levels across regions.', NOW() - INTERVAL '4 hours');

-- Conversation 8: Sarah's project conversation
INSERT INTO messages (conversation_id, role, content, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440208', 'user', 'Compare engagement metrics between North America and EMEA', NOW() - INTERVAL '3 hours'),
    ('550e8400-e29b-41d4-a716-446655440208', 'assistant', 'North America shows 72% overall engagement compared to EMEA''s 68%. However, EMEA has 15% higher medical content engagement, suggesting different content preferences.', NOW() - INTERVAL '3 hours');

-- Conversation 11: Michael's conversation
INSERT INTO messages (conversation_id, role, content, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440211', 'user', 'Show me the vaccine campaign results for APAC region', NOW() - INTERVAL '6 hours'),
    ('550e8400-e29b-41d4-a716-446655440211', 'assistant', 'APAC vaccine campaigns achieved 58% reach with 42% engagement rate. Digital channels contributed 65% of total interactions, exceeding the 50% target.', NOW() - INTERVAL '6 hours');

-- Insert personal prompts
INSERT INTO prompts (user_id, title, content, type, is_personal, is_starred) VALUES
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Email Campaign Analysis',
        'Analyze email campaign performance focusing on: 1) Open rates by content type, 2) Regional variations, 3) Time-based trends, 4) Benchmark comparisons. Provide actionable recommendations.',
        'final',
        TRUE,
        TRUE
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Quick Metrics Summary',
        'Provide a concise summary of key metrics with bullet points',
        'suggestion',
        TRUE,
        FALSE
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Channel Performance Deep Dive',
        'Analyze channel performance including: field vs digital ratios, interaction quality scores, cost per interaction, and engagement trends. Include regional benchmarks.',
        'final',
        TRUE,
        FALSE
    ),
    (
        '550e8400-e29b-41d4-a716-446655440001',
        'Regional Benchmark Report',
        'Compare performance metrics across regions including engagement rates, channel mix, and execution quality. Highlight top and bottom performers.',
        'final',
        TRUE,
        TRUE
    ),
    (
        '550e8400-e29b-41d4-a716-446655440001',
        'Trend Analysis',
        'Show me month-over-month trends for',
        'suggestion',
        TRUE,
        FALSE
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002',
        'Campaign ROI Calculator',
        'Calculate campaign ROI including: total reach, engagement rate, cost per engagement, and revenue attribution. Include methodology explanation.',
        'final',
        TRUE,
        FALSE
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
