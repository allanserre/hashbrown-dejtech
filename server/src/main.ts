import express from 'express';
import cors from 'cors';
import { Chat } from '@hashbrownai/core';
import { HashbrownOpenAI } from '@hashbrownai/openai';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Decode binary hashbrown frames (format: [4-byte BE length][UTF-8 JSON])
 * and extract the assistant text from generation-chunk frames.
 */
function extractTextFromChunks(chunks: Uint8Array[]): string {
  const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  let offset = 0;
  let fullText = '';

  while (offset < buffer.length) {
    if (offset + 4 > buffer.length) break;
    const frameLen = buffer.readUInt32BE(offset);
    offset += 4;
    if (offset + frameLen > buffer.length) break;
    const frameJson = buffer.subarray(offset, offset + frameLen).toString('utf-8');
    offset += frameLen;

    try {
      const frame = JSON.parse(frameJson) as { type: string; chunk?: { choices?: { delta?: { content?: string } }[] } };
      if (frame.type === 'generation-chunk') {
        const delta = frame.chunk?.choices?.[0]?.delta?.content;
        if (delta) fullText += delta;
      }
    } catch {
      // ignore malformed frames
    }
  }

  return fullText;
}

app.post('/api/chat', async (req, res) => {
  const completionParams = req.body as Chat.Api.CompletionCreateParams;

  const lastUserMsg = [...(completionParams.messages ?? [])]
    .reverse()
    .find((m) => m.role === 'user');
  const userText =
    typeof lastUserMsg?.content === 'string'
      ? lastUserMsg.content
      : JSON.stringify(lastUserMsg?.content ?? '');

  console.log(`\n[chat ➜ user]  ${userText}`);

  try {
    const response = HashbrownOpenAI.stream.text({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENAI_API_KEY,
      request: completionParams,
    });

    res.header('Content-Type', 'application/octet-stream');

    const collectedChunks: Uint8Array[] = [];

    for await (const chunk of response) {
      collectedChunks.push(chunk);
      res.write(chunk);
    }

    res.end();

    const assistantText = extractTextFromChunks(collectedChunks);
    if (assistantText) {
      console.log(`[chat ◀ assistant]  ${assistantText}\n`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack   = err instanceof Error ? err.stack   : undefined;

    console.error(`\n[chat ✖ error]  ${message}`);
    if (stack) console.error(stack);

    // Log the raw body to help diagnose bad requests
    console.error('[chat ✖ request body]', JSON.stringify(req.body, null, 2));

    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      // Headers already sent (streaming started) — close the connection cleanly
      res.end();
    }
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
