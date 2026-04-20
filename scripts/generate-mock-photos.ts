// Run: npm install openai
// Usage: npx tsx scripts/generate-mock-photos.ts
//
// Requires OPENAI_API_KEY in environment.
// Saves portrait images to public/mock-pcc/residents/

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// Dynamic import so the missing-package error is clear
async function getOpenAI() {
  try {
    const { default: OpenAI } = await import('openai');
    return OpenAI;
  } catch {
    console.error('\n  ERROR: openai package not found.\n  Run: npm install openai\n');
    process.exit(1);
  }
}

const PORTRAITS: { name: string; filename: string; prompt: string }[] = [
  {
    name: 'Margaret Chen',
    filename: 'margaret.jpg',
    prompt:
      'Photorealistic portrait of an elderly Asian woman in her early 80s named Margaret, warm smile, white hair, wearing a light blue cardigan, soft natural lighting, memory care facility setting, high quality photo',
  },
  {
    name: 'Robert Johnson',
    filename: 'robert.jpg',
    prompt:
      'Photorealistic portrait of an elderly African American man in his mid-70s named Robert, friendly expression, graying temples, wearing a striped polo shirt, recovery facility setting, warm lighting, high quality photo',
  },
  {
    name: 'Eleanor Martinez',
    filename: 'eleanor.jpg',
    prompt:
      'Photorealistic portrait of an elderly Hispanic woman in her late 70s named Eleanor, gentle expression, silver hair in a bun, wearing a floral blouse, seated comfortably, soft lighting, high quality photo',
  },
  {
    name: 'Frank Davis',
    filename: 'frank.jpg',
    prompt:
      'Photorealistic portrait of an elderly Caucasian man in his early 80s named Frank, dignified expression, white hair, wearing a simple button-up shirt, neutral background, high quality photo',
  },
  {
    name: 'Dorothy Williams',
    filename: 'dorothy.jpg',
    prompt:
      'Photorealistic portrait of an elderly African American woman in her late 70s named Dorothy, kind expression, short silver hair, wearing a purple top, comfortable sitting area background, soft lighting, high quality photo',
  },
];

function downloadImage(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        const redirectUrl = response.headers.location;
        if (!redirectUrl) return reject(new Error('Redirect with no location'));
        return downloadImage(redirectUrl, destPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        return reject(new Error(`HTTP ${response.statusCode} downloading image`));
      }

      response.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
      file.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('\n  ERROR: OPENAI_API_KEY environment variable is not set.\n');
    process.exit(1);
  }

  const OpenAI = await getOpenAI();
  const openai = new OpenAI({ apiKey });

  const outputDir = path.join(process.cwd(), 'public', 'mock-pcc', 'residents');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  for (const portrait of PORTRAITS) {
    const destPath = path.join(outputDir, portrait.filename);

    if (fs.existsSync(destPath)) {
      console.log(`[skip] ${portrait.name} — already exists at ${destPath}`);
      continue;
    }

    console.log(`[generating] ${portrait.name}...`);

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: portrait.prompt,
        quality: 'standard',
        size: '1024x1024',
        n: 1,
      });

      const imageUrl = response.data?.[0]?.url;
      if (!imageUrl) {
        console.error(`  ERROR: No URL returned for ${portrait.name}`);
        continue;
      }

      console.log(`[downloading] ${portrait.name}...`);
      await downloadImage(imageUrl, destPath);
      console.log(`[saved] ${portrait.filename}`);
    } catch (err) {
      console.error(`  ERROR generating ${portrait.name}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log('\nPhotos saved to public/mock-pcc/residents/');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
