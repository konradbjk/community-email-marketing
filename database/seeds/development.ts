/**
 * Development Data Seeding
 * Seeds demo user with projects, conversations, and messages
 * Should ONLY be run in development environment
 */

import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { ResponseStyle } from '../entities/response-style.entity';
import { Project } from '../entities/project.entity';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { Prompt } from '../entities/prompt.entity';

export async function seedDevelopmentData(dataSource: DataSource): Promise<void> {
  console.log('📦 Seeding development data...');

  const userRepository = dataSource.getRepository(User);
  const userProfileRepository = dataSource.getRepository(UserProfile);
  const responseStyleRepository = dataSource.getRepository(ResponseStyle);
  const projectRepository = dataSource.getRepository(Project);
  const conversationRepository = dataSource.getRepository(Conversation);
  const messageRepository = dataSource.getRepository(Message);
  const promptRepository = dataSource.getRepository(Prompt);

  // Check if demo user already exists
  const existingUser = await userRepository.findOne({
    where: { merck_id: 'm277098' },
  });

  if (existingUser) {
    console.log('✓ Development data already seeded, skipping...');
    return;
  }

  // Create demo user
  const demoUser = userRepository.create({
    merck_id: 'm277098',
    name: 'Alex',
    surname: 'Johnson',
    email: 'alex.johnson@merck.com',
    image: 'https://avatar.iran.liara.run/public/43',
  });
  await userRepository.save(demoUser);
  console.log('  ✓ Created demo user: Alex Johnson');

  // Get default response style
  const normalStyle = await responseStyleRepository.findOne({
    where: { label: 'Normal' },
  });

  // Create user profile
  const userProfile = userProfileRepository.create({
    user_id: demoUser.id,
    role: 'Senior Marketing Manager',
    department: 'Oncology Business Unit',
    region: 'EMEA',
    role_description:
      'I lead marketing analytics for the Oncology portfolio, focusing on digital channel optimization and customer segmentation strategies.',
    ai_response_style_id: normalStyle?.id,
    custom_instructions:
      'When analyzing data, please focus on actionable insights and include benchmarks against regional averages. I prefer visual representations when discussing trends.',
  });
  await userProfileRepository.save(userProfile);
  console.log('  ✓ Created user profile');

  // Create projects
  const projects = [
    {
      name: 'omnichannel-analytics',
      display_name: 'Omnichannel Analytics Dashboard',
      description:
        'Track field vs digital interaction ratios, channel performance, and customer engagement across all touchpoints',
      custom_instructions:
        'Always include field vs digital ratio comparisons. Focus on EMEA regions (Germany, France, UK, Italy, Spain). Benchmark against 65% digital target. Highlight trends in face-to-face interaction quality scores.',
      is_starred: true,
    },
    {
      name: 'email-performance-insights',
      display_name: 'Email Performance Insights',
      description:
        'Analyze email open rates by content type (Commercial, Medical, Promotional, Event) across regions and customer segments',
      custom_instructions:
        'Break down metrics by content type: Commercial, Medical, Promotional, Event. Compare open rates against industry benchmarks (Medical: 24%, Commercial: 18%). Segment by HCP specialty and engagement tier.',
      is_starred: false,
    },
    {
      name: 'customer-segmentation',
      display_name: 'Customer Segmentation Analysis',
      description:
        'Economic and behavioral segmentation analysis, HCP opt-in tracking, and segment performance evaluation',
      custom_instructions:
        'Focus on premium vs value segment analysis. Track opt-in rates by segment. Analyze engagement patterns across economic tiers. Provide recommendations for segment-specific strategies.',
      is_starred: true,
    },
  ];

  const createdProjects: Project[] = [];
  for (const projectData of projects) {
    const project = projectRepository.create({
      ...projectData,
      user_id: demoUser.id,
    });
    await projectRepository.save(project);
    createdProjects.push(project);
    console.log(`  ✓ Created project: ${projectData.display_name}`);
  }

  // Create conversations
  const now = new Date();
  const conversations = [
    {
      project: createdProjects[1],
      title: 'Email Open Rates by Content Type',
      is_starred: true,
      is_archived: false,
      updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      project: createdProjects[0],
      title: 'Q1 2025 Omnichannel Performance',
      is_starred: true,
      is_archived: false,
      updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      project: null,
      title: 'HCP Engagement Trends December',
      is_starred: false,
      is_archived: false,
      updated_at: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
    },
    {
      project: createdProjects[2],
      title: 'Premium Segment Deep Dive',
      is_starred: true,
      is_archived: false,
      updated_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
    },
    {
      project: null,
      title: 'Channel Mix Analysis November',
      is_starred: false,
      is_archived: false,
      updated_at: new Date(now.getTime() - 58 * 24 * 60 * 60 * 1000), // 58 days ago
    },
    {
      project: null,
      title: 'Regional Benchmarking Study',
      is_starred: false,
      is_archived: true,
      updated_at: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000), // 65 days ago
    },
    {
      project: createdProjects[0],
      title: 'Digital Adoption Rate Analysis',
      is_starred: false,
      is_archived: false,
      updated_at: new Date(now.getTime() - 88 * 24 * 60 * 60 * 1000), // 88 days ago
    },
    {
      project: null,
      title: 'Q3 Performance Review',
      is_starred: false,
      is_archived: true,
      updated_at: new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000), // 95 days ago
    },
    {
      project: null,
      title: 'Face-to-Face Effectiveness Study',
      is_starred: false,
      is_archived: false,
      updated_at: new Date(now.getTime() - 118 * 24 * 60 * 60 * 1000), // 118 days ago
    },
    {
      project: createdProjects[1],
      title: 'Email Campaign Strategy 2024',
      is_starred: false,
      is_archived: true,
      updated_at: new Date(now.getTime() - 125 * 24 * 60 * 60 * 1000), // 125 days ago
    },
    {
      project: null,
      title: 'Customer Journey Mapping',
      is_starred: false,
      is_archived: false,
      updated_at: new Date(now.getTime() - 155 * 24 * 60 * 60 * 1000), // 155 days ago
    },
    {
      project: createdProjects[2],
      title: 'Segmentation Model Review H1 2024',
      is_starred: false,
      is_archived: true,
      updated_at: new Date(now.getTime() - 175 * 24 * 60 * 60 * 1000), // 175 days ago
    },
  ];

  const createdConversations: Conversation[] = [];
  for (const convData of conversations) {
    const { project, ...conversationData } = convData;
    const conversation = conversationRepository.create({
      ...conversationData,
      user_id: demoUser.id,
      project_id: project?.id,
    });
    await conversationRepository.save(conversation);
    createdConversations.push(conversation);
  }
  console.log(`  ✓ Created ${conversations.length} conversations`);

  // Create sample messages for first 4 conversations
  const messages = [
    // Conversation 1: Email Open Rates
    {
      conversation: createdConversations[0],
      messages: [
        {
          id: 'msg_001',
          role: 'user' as const,
          content: 'Can you analyze our email open rates across different content types for Q4?',
        },
        {
          id: 'msg_002',
          role: 'assistant' as const,
          content:
            'Based on the Q4 analysis, medical emails achieve 24% open rates compared to 18% for promotional content across all EMEA regions. Event-based emails show 21% open rates, while commercial messages sit at 16%. This 6-8 point difference is consistent with industry benchmarks for healthcare communications.',
        },
        {
          id: 'msg_003',
          role: 'user' as const,
          content: 'How do these rates compare by country?',
        },
        {
          id: 'msg_004',
          role: 'assistant' as const,
          content:
            'Germany leads with 26% average open rate, followed by France at 23% and UK at 22%. Spain and Italy show slightly lower rates at 19% and 20% respectively. The variance is primarily driven by medical content performance.',
        },
      ],
    },
    // Conversation 2: Omnichannel Performance
    {
      conversation: createdConversations[1],
      messages: [
        {
          id: 'msg_005',
          role: 'user' as const,
          content: 'Show me the Q1 omnichannel performance trends',
        },
        {
          id: 'msg_006',
          role: 'assistant' as const,
          content:
            'Q1 shows digital interactions at 67%, exceeding our 65% target. Face-to-face quality scores remain strong at 4.2/5.0. Field execution rate is 78%, up 3 points from Q4. The omnichannel mix is well-balanced with no quality degradation.',
        },
      ],
    },
    // Conversation 3: HCP Engagement
    {
      conversation: createdConversations[2],
      messages: [
        {
          id: 'msg_007',
          role: 'user' as const,
          content: 'What were the key HCP engagement trends in December?',
        },
        {
          id: 'msg_008',
          role: 'assistant' as const,
          content:
            'December showed 72% overall HCP engagement, with oncologists leading at 78%. Engagement dropped slightly during holiday weeks (Dec 18-31) to 65%, which is expected seasonally. Digital touchpoints increased 15% compared to November, compensating for reduced face-to-face availability.',
        },
      ],
    },
    // Conversation 4: Premium Segment
    {
      conversation: createdConversations[3],
      messages: [
        {
          id: 'msg_009',
          role: 'user' as const,
          content: 'Analyze the premium segment engagement and behavior patterns',
        },
        {
          id: 'msg_010',
          role: 'assistant' as const,
          content:
            'Premium segment shows 68% engagement rate with strong preference for medical content (82% open rate). Average interaction frequency is 2.3 times per week. This segment responds particularly well to face-to-face meetings (quality score 4.5/5.0) combined with medical email follow-ups. Opt-in rate for premium segment is 91%, significantly higher than value segment at 62%.',
        },
        {
          id: 'msg_011',
          role: 'user' as const,
          content: 'What channels work best for this segment?',
        },
        {
          id: 'msg_012',
          role: 'assistant' as const,
          content:
            'Premium segment engagement is highest through: 1) Face-to-face meetings (85% engagement), 2) Medical emails (82%), 3) Webinars (78%). Commercial and promotional channels show lower engagement at 45-50%. Recommend focusing on medical content and in-person interactions for this segment.',
        },
      ],
    },
  ];

  let totalMessages = 0;
  for (const messageGroup of messages) {
    for (const msgData of messageGroup.messages) {
      const message = messageRepository.create({
        ...msgData,
        conversation_id: messageGroup.conversation.id,
        created_at: messageGroup.conversation.updated_at,
      });
      await messageRepository.save(message);
      totalMessages++;
    }
  }
  console.log(`  ✓ Created ${totalMessages} messages`);

  // Create personal prompts
  const prompts = [
    {
      title: 'Email Campaign Analysis',
      content:
        'Analyze email campaign performance focusing on: 1) Open rates by content type (Medical, Commercial, Promotional, Event), 2) Regional variations across EMEA, 3) Time-based trends, 4) Benchmark comparisons against industry standards. Provide actionable recommendations for improvement.',
      type: 'final' as const,
      is_starred: true,
    },
    {
      title: 'Quick Metrics Summary',
      content: 'Provide a concise summary of key performance metrics with bullet points',
      type: 'suggestion' as const,
      is_starred: false,
    },
    {
      title: 'Channel Performance Deep Dive',
      content:
        'Analyze channel performance including: field vs digital ratios, interaction quality scores, cost per interaction, and engagement trends. Include regional benchmarks across Germany, France, UK, Italy, and Spain. Compare against 65% digital target.',
      type: 'final' as const,
      is_starred: false,
    },
    {
      title: 'Segmentation Analysis Template',
      content:
        'Analyze customer segment performance including: premium vs value segment engagement, opt-in rates by segment, channel preferences, and interaction frequency. Provide segment-specific strategy recommendations.',
      type: 'final' as const,
      is_starred: true,
    },
  ];

  for (const promptData of prompts) {
    const prompt = promptRepository.create({
      ...promptData,
      user_id: demoUser.id,
      is_personal: true,
    });
    await promptRepository.save(prompt);
  }
  console.log(`  ✓ Created ${prompts.length} personal prompts`);

  console.log('✅ Development data seeded successfully');
}
