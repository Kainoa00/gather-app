/**
 * Setup Agents — One-time script to create Managed Agent definitions
 * and a shared environment via the Anthropic API.
 *
 * Run: npx tsx scripts/setup-agents.ts
 *
 * Outputs the agent and environment IDs to add to .env.local:
 *   ANTHROPIC_AGENT_INSIGHTS_ID=...
 *   ANTHROPIC_AGENT_SHIFT_REPORT_ID=...
 *   ANTHROPIC_ENVIRONMENT_ID=...
 */

import Anthropic from '@anthropic-ai/sdk'
import { CARE_INSIGHTS_SYSTEM_PROMPT } from '../src/lib/agents/prompts/care-insights'
import { SHIFT_REPORT_SYSTEM_PROMPT } from '../src/lib/agents/prompts/shift-report'

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })

  console.log('=== CareBridge Connect — Managed Agents Setup ===\n')

  // -------------------------------------------
  // 1. Create Environment
  // -------------------------------------------
  console.log('Creating environment...')
  const environment = await client.beta.environments.create({
    name: 'carebridge-production',
    config: {
      type: 'cloud',
      networking: { type: 'unrestricted' },
    },
  })
  console.log(`  Environment ID: ${environment.id}\n`)

  // -------------------------------------------
  // 2. Create Care Insights Agent
  // -------------------------------------------
  console.log('Creating Care Insights Agent...')
  const insightsAgent = await client.beta.agents.create({
    name: 'CareBridge Care Insights',
    model: 'claude-sonnet-4-6',
    system: CARE_INSIGHTS_SYSTEM_PROMPT,
    tools: [
      { type: 'agent_toolset_20260401' },
    ],
  })
  console.log(`  Agent ID: ${insightsAgent.id} (v${insightsAgent.version})\n`)

  // -------------------------------------------
  // 3. Create Shift Report Agent
  // -------------------------------------------
  console.log('Creating Shift Report Agent...')
  const shiftAgent = await client.beta.agents.create({
    name: 'CareBridge Shift Report',
    model: 'claude-sonnet-4-6',
    system: SHIFT_REPORT_SYSTEM_PROMPT,
    tools: [
      { type: 'agent_toolset_20260401' },
    ],
  })
  console.log(`  Agent ID: ${shiftAgent.id} (v${shiftAgent.version})\n`)

  // -------------------------------------------
  // Output
  // -------------------------------------------
  console.log('=== Add these to your .env.local ===\n')
  console.log(`ANTHROPIC_AGENT_INSIGHTS_ID=${insightsAgent.id}`)
  console.log(`ANTHROPIC_AGENT_SHIFT_REPORT_ID=${shiftAgent.id}`)
  console.log(`ANTHROPIC_ENVIRONMENT_ID=${environment.id}`)
  console.log('')
  console.log('Setup complete!')
}

main().catch((error) => {
  console.error('Setup failed:', error)
  process.exit(1)
})
