/**
 * Reference Data Seeding
 * Seeds required system data (response styles)
 * Should be run in all environments (development, staging, production)
 */

import { DataSource } from 'typeorm';
import { ResponseStyle } from '../entities/response-style.entity';

export async function seedReferenceData(dataSource: DataSource): Promise<void> {
  console.log('📦 Seeding reference data...');

  const responseStyleRepository = dataSource.getRepository(ResponseStyle);

  // Define response styles
  const responseStyles = [
    {
      label: 'Normal',
      description: 'Balanced responses with detailed explanations',
      system_prompt:
        'Provide comprehensive, balanced responses with clear explanations. Use the custom instructions provided by the user.',
      is_default: true,
    },
    {
      label: 'Concise',
      description: 'Brief, to-the-point responses',
      system_prompt:
        'Keep responses concise and focused. Get straight to the point without unnecessary elaboration.',
      is_default: false,
    },
    {
      label: 'Learning',
      description: 'Educational responses with context',
      system_prompt:
        'Provide responses that teach and explain concepts. Include background information and step-by-step reasoning.',
      is_default: false,
    },
    {
      label: 'Formal',
      description: 'Professional business communication',
      system_prompt:
        'Use formal business language. Maintain professional tone suitable for executive communication.',
      is_default: false,
    },
  ];

  // Check if response styles already exist
  const existingCount = await responseStyleRepository.count();

  if (existingCount > 0) {
    console.log('✓ Response styles already seeded, skipping...');
    return;
  }

  // Create response styles
  for (const styleData of responseStyles) {
    const style = responseStyleRepository.create(styleData);
    await responseStyleRepository.save(style);
    console.log(`  ✓ Created response style: ${styleData.label}`);
  }

  console.log('✅ Reference data seeded successfully');
}
