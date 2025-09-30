// DEMO MODE: AI provider configuration disabled
// To restore real AI functionality, uncomment the code below

// import { createAzure } from '@ai-sdk/azure'

// export const azure = createAzure({
//   resourceName: 'uptimize-merck', // This is ignored when using baseURL
//   apiKey: process.env.AZURE_OPENAI_API_KEY!,
//   baseURL: 'https://api.nlp.dev.uptimize.merckgroup.com/model',
//   headers: {
//     'openai-standard': 'True',
//   },
// })

// // Model name from your Python code
// export const CLAUDE_SONNET_4 = 'us.anthropic.claude-sonnet-4-20250514-v1:0'

// Placeholder exports for demo mode (prevents import errors)
export const azure = null;
export const CLAUDE_SONNET_4 = null;