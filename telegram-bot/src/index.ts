import dotenv from "dotenv";
dotenv.config({ override: true }); // override: true forces load even if var already set in system env

import { Bot, Context } from "grammy";
import Anthropic from "@anthropic-ai/sdk";
import { spawn } from "child_process";
import { execSync } from "child_process";

// ── Config ──────────────────────────────────────────────────────────────────
const BOT_TOKEN = process.env.BOT_TOKEN;
const ALLOWED_CHAT_ID = process.env.ALLOWED_CHAT_ID;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PROJECT_DIR = process.env.PROJECT_DIR;

if (!BOT_TOKEN || !ALLOWED_CHAT_ID || !ANTHROPIC_API_KEY || !PROJECT_DIR) {
  console.error(
    "Missing required env vars. Copy .env.example to .env and fill in all values."
  );
  process.exit(1);
}

const ALLOWED_ID = parseInt(ALLOWED_CHAT_ID, 10);

// ── Clients ──────────────────────────────────────────────────────────────────
const bot = new Bot(BOT_TOKEN);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ── Conversation history (in-memory, resets on restart) ─────────────────────
type Message = { role: "user" | "assistant"; content: string };
const history: Message[] = [];
const MAX_HISTORY = 20; // keep last 20 exchanges

const SYSTEM_PROMPT = `You are a senior full-stack engineer working on CareBridge Connect — a healthcare communication platform that connects parents with childcare providers.

Tech stack:
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Anthropic Claude API for AI features
- Resend for transactional emails
- Framer Motion for animations
- Deployed on Vercel

Key directories (inside carebridge-connect/):
- src/app/           Next.js App Router pages and API routes
- src/components/    Reusable React components
- src/lib/           Utilities, Supabase clients, helpers
- src/types/         TypeScript type definitions

You help the developer (accessed via Telegram on their phone) with:
- Code questions and debugging
- Feature planning and architecture decisions
- Code snippets and implementation guidance
- Reviewing approaches before making changes

Be concise — responses are read on a phone screen. Use short paragraphs and code blocks when helpful.`;

// ── Auth guard ───────────────────────────────────────────────────────────────
function isAuthorized(ctx: Context): boolean {
  return ctx.chat?.id === ALLOWED_ID;
}

// ── Helper: send long messages in chunks ────────────────────────────────────
async function sendChunked(ctx: Context, text: string): Promise<void> {
  const MAX = 4000;
  if (text.length <= MAX) {
    await ctx.reply(text, { parse_mode: "Markdown" });
    return;
  }
  for (let i = 0; i < text.length; i += MAX) {
    await ctx.reply(text.slice(i, i + MAX), { parse_mode: "Markdown" });
  }
}

// ── Helper: run a shell command and return output ───────────────────────────
function runCommand(cmd: string, cwd: string): Promise<string> {
  return new Promise((resolve) => {
    let output = "";
    let error = "";
    const proc = spawn(cmd, { shell: true, cwd });
    proc.stdout.on("data", (d) => (output += d.toString()));
    proc.stderr.on("data", (d) => (error += d.toString()));
    proc.on("close", (code) => {
      const combined = [output, error].filter(Boolean).join("\n");
      resolve(combined || `Process exited with code ${code}`);
    });
    // Safety timeout: kill after 5 minutes
    setTimeout(() => {
      proc.kill();
      resolve(output || "Timed out after 5 minutes.");
    }, 5 * 60 * 1000);
  });
}

// ── /start ───────────────────────────────────────────────────────────────────
bot.command("start", async (ctx) => {
  if (!isAuthorized(ctx)) return;
  await ctx.reply(
    `👋 *CareBridge Connect Bot* ready!\n\n` +
      `*Chat*: Just send any message to talk with Claude about the project.\n\n` +
      `*Commands:*\n` +
      `/code <instruction> — Run a Claude Code command on your machine\n` +
      `/status — Git status + recent commits\n` +
      `/clear — Clear conversation history\n` +
      `/help — Show this message`,
    { parse_mode: "Markdown" }
  );
});

// ── /help ────────────────────────────────────────────────────────────────────
bot.command("help", async (ctx) => {
  if (!isAuthorized(ctx)) return;
  await ctx.reply(
    `*Commands:*\n\n` +
      `/code <instruction> — Run Claude Code in the project directory\n` +
      `  Example: \`/code fix the login button on mobile\`\n\n` +
      `/status — Git status + last 5 commits\n\n` +
      `/clear — Reset conversation history\n\n` +
      `*Chat:* Send any message to ask Claude about the codebase.`,
    { parse_mode: "Markdown" }
  );
});

// ── /clear ───────────────────────────────────────────────────────────────────
bot.command("clear", async (ctx) => {
  if (!isAuthorized(ctx)) return;
  history.length = 0;
  await ctx.reply("Conversation history cleared.");
});

// ── /status ──────────────────────────────────────────────────────────────────
bot.command("status", async (ctx) => {
  if (!isAuthorized(ctx)) return;
  const thinking = await ctx.reply("Checking git status...");
  try {
    const status = execSync("git status --short", { cwd: PROJECT_DIR }).toString().trim();
    const log = execSync("git log --oneline -7", { cwd: PROJECT_DIR }).toString().trim();
    const reply =
      `*Git Status:*\n\`\`\`\n${status || "Working tree clean"}\n\`\`\`\n\n` +
      `*Recent Commits:*\n\`\`\`\n${log}\n\`\`\``;
    await ctx.api.deleteMessage(ctx.chat!.id, thinking.message_id);
    await sendChunked(ctx, reply);
  } catch (e) {
    await ctx.reply(`Error: ${e}`);
  }
});

// ── /code ────────────────────────────────────────────────────────────────────
bot.command("code", async (ctx) => {
  if (!isAuthorized(ctx)) return;
  const instruction = ctx.match?.trim();
  if (!instruction) {
    await ctx.reply("Usage: `/code <your instruction>`\n\nExample:\n`/code add a loading spinner to the submit button`", {
      parse_mode: "Markdown",
    });
    return;
  }

  const thinking = await ctx.reply(`Running Claude Code...\n\n_"${instruction}"_`, {
    parse_mode: "Markdown",
  });

  // Run: claude --print "<instruction>" in the project directory
  const output = await runCommand(`claude --print "${instruction.replace(/"/g, '\\"')}"`, PROJECT_DIR!);

  await ctx.api.deleteMessage(ctx.chat!.id, thinking.message_id);

  const truncated =
    output.length > 3800
      ? output.slice(0, 3800) + "\n\n_(output truncated)_"
      : output;

  await sendChunked(ctx, `*Claude Code result:*\n\`\`\`\n${truncated}\n\`\`\``);
});

// ── Regular messages → Claude AI chat ────────────────────────────────────────
bot.on("message:text", async (ctx) => {
  if (!isAuthorized(ctx)) return;

  const userText = ctx.message.text;

  // Add to history
  history.push({ role: "user", content: userText });
  if (history.length > MAX_HISTORY * 2) {
    history.splice(0, 2); // drop oldest pair
  }

  const thinking = await ctx.reply("...");

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: history,
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "(no response)";

    history.push({ role: "assistant", content: reply });

    await ctx.api.deleteMessage(ctx.chat!.id, thinking.message_id);
    await sendChunked(ctx, reply);
  } catch (e) {
    await ctx.api.deleteMessage(ctx.chat!.id, thinking.message_id);
    await ctx.reply(`Error talking to Claude: ${e}`);
  }
});

// ── Start polling ─────────────────────────────────────────────────────────────
console.log("CareBridge Telegram Bot starting...");
bot.start({
  onStart: () => console.log("Bot is running. Send a message on Telegram!"),
});
