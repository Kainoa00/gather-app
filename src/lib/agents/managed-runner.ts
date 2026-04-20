/**
 * Managed Agent Runner — Lifecycle manager for Anthropic Managed Agents.
 *
 * Handles the full agent lifecycle:
 *   1. Create or reuse agent definitions
 *   2. Create or reuse environments
 *   3. Start sessions, send messages, stream responses
 *   4. Capture structured output from agent responses
 *
 * Uses the managed-agents-2026-04-01 beta API.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { TokenUsage } from './types'

// -------------------------------------------
// Client initialization
// -------------------------------------------

let anthropicClient: Anthropic | null = null

function getClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('[managed-runner] ANTHROPIC_API_KEY is not configured')
    }
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
}

// -------------------------------------------
// Agent Management
// -------------------------------------------

/**
 * Create a new Managed Agent definition via the Anthropic API.
 * Returns the agent ID and version.
 */
export async function createAgent(params: {
  name: string
  model: string
  systemPrompt: string
}): Promise<{ id: string; version: number }> {
  const client = getClient()

  const agent = await client.beta.agents.create({
    name: params.name,
    model: params.model,
    system: params.systemPrompt,
    tools: [
      { type: 'agent_toolset_20260401' },
    ],
  })

  console.log(`[managed-runner] Created agent: ${agent.id} (v${agent.version})`)
  return { id: agent.id, version: agent.version }
}

/**
 * Get an agent by ID to verify it exists.
 */
export async function getAgent(agentId: string) {
  const client = getClient()

  try {
    const agent = await client.beta.agents.retrieve(agentId)
    return agent
  } catch (error) {
    console.error(`[managed-runner] Agent ${agentId} not found:`, error)
    return null
  }
}

// -------------------------------------------
// Environment Management
// -------------------------------------------

/**
 * Create a new environment for agent execution.
 * Uses restricted networking by default for HIPAA compliance.
 */
export async function createEnvironment(params: {
  name: string
  networkType?: 'unrestricted' | 'restricted'
}): Promise<{ id: string }> {
  const client = getClient()

  const environment = await client.beta.environments.create({
    name: params.name,
    config: {
      type: 'cloud',
      networking: { type: (params.networkType || 'unrestricted') as 'unrestricted' },
    },
  })

  console.log(`[managed-runner] Created environment: ${environment.id}`)
  return { id: environment.id }
}

// -------------------------------------------
// Session Execution
// -------------------------------------------

export interface AgentSessionResult {
  sessionId: string
  output: string
  tokenUsage: TokenUsage
  events: AgentEvent[]
}

interface AgentEvent {
  type: string
  content?: string
  toolName?: string
}

/**
 * Run a complete Managed Agent session:
 *   1. Create session
 *   2. Open stream
 *   3. Send user message
 *   4. Collect agent responses until idle
 *   5. Return structured output
 */
export async function runAgentSession(params: {
  agentId: string
  environmentId: string
  title: string
  message: string
}): Promise<AgentSessionResult> {
  const client = getClient()

  // 1. Create session
  const session = await client.beta.sessions.create({
    agent: params.agentId,
    environment_id: params.environmentId,
    title: params.title,
  })

  console.log(`[managed-runner] Session created: ${session.id}`)

  // 2. Open stream and send message
  const stream = await client.beta.sessions.events.stream(session.id)

  await client.beta.sessions.events.send(session.id, {
    events: [
      {
        type: 'user.message',
        content: [
          {
            type: 'text',
            text: params.message,
          },
        ],
      },
    ],
  })

  // 3. Collect responses
  const events: AgentEvent[] = []
  let fullOutput = ''
  const tokenUsage: TokenUsage = { input_tokens: 0, output_tokens: 0 }

  for await (const event of stream) {
    if (event.type === 'agent.message') {
      const messageEvent = event as { type: string; content: Array<{ type: string; text: string }> }
      for (const block of messageEvent.content) {
        if (block.type === 'text') {
          fullOutput += block.text
        }
      }
      events.push({ type: 'agent.message', content: fullOutput })
    } else if (event.type === 'agent.tool_use') {
      const toolEvent = event as { type: string; name: string }
      events.push({ type: 'agent.tool_use', toolName: toolEvent.name })
      console.log(`[managed-runner] Tool used: ${toolEvent.name}`)
    } else if (event.type === 'session.status_idle') {
      console.log(`[managed-runner] Session ${session.id} completed`)
      break
    }
  }

  return {
    sessionId: session.id,
    output: fullOutput,
    tokenUsage,
    events,
  }
}

/**
 * Extract JSON from an agent's text output.
 * Handles markdown code blocks and raw JSON.
 */
export function extractJsonFromOutput<T>(output: string): T | null {
  // Try to extract JSON from markdown code block
  const codeBlockMatch = output.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as T
    } catch {
      // Fall through to next attempt
    }
  }

  // Try to parse the entire output as JSON
  try {
    return JSON.parse(output.trim()) as T
  } catch {
    // Fall through
  }

  // Try to find the first { ... } block
  const jsonMatch = output.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as T
    } catch {
      // Fall through
    }
  }

  console.error('[managed-runner] Failed to extract JSON from agent output')
  return null
}

// -------------------------------------------
// Convenience: Run agent with JSON output
// -------------------------------------------

/**
 * Run a managed agent session and parse the output as structured JSON.
 * This is the primary entry point for most agent executions.
 */
export async function runAgentWithJsonOutput<T>(params: {
  agentId: string
  environmentId: string
  title: string
  message: string
}): Promise<{
  result: T | null
  sessionId: string
  rawOutput: string
  tokenUsage: TokenUsage
}> {
  const sessionResult = await runAgentSession(params)

  const parsed = extractJsonFromOutput<T>(sessionResult.output)

  return {
    result: parsed,
    sessionId: sessionResult.sessionId,
    rawOutput: sessionResult.output,
    tokenUsage: sessionResult.tokenUsage,
  }
}
