import { Redis } from '@upstash/redis';

const RUN_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{7,63}$/;
const MAX_BODY_BYTES = 32 * 1024;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

// The upstash-kv marketplace product injects KV_* names, not the canonical
// UPSTASH_* names Redis.fromEnv() reads, so the client is built by hand.
function redisFromEnv(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fieldString(
  body: Record<string, unknown>,
  key: string,
  maxLength: number,
): string | null {
  const value = body[key];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}

export async function POST(request: Request): Promise<Response> {
  const redis = redisFromEnv();
  if (redis === null) {
    return json(503, { error: 'The log store is not configured.' });
  }
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MAX_BODY_BYTES) {
    return json(400, { error: 'Body too large.' });
  }
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return json(400, { error: 'Body too large.' });
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return json(400, { error: 'Body is not JSON.' });
  }
  if (!isRecord(raw)) {
    return json(400, { error: 'Body must be a JSON object.' });
  }
  const runId = fieldString(raw, 'runId', 64);
  if (runId === null || !RUN_ID.test(runId)) {
    return json(400, { error: 'runId is not a run id.' });
  }
  const tester = fieldString(raw, 'tester', 80);
  const proto = fieldString(raw, 'proto', 80);
  const commit = fieldString(raw, 'commit', 64);
  const event = raw['event'];
  if (tester === null || proto === null || commit === null) {
    return json(400, { error: 'tester, proto, and commit must be strings.' });
  }
  if (!isRecord(event)) {
    return json(400, { error: 'event must be a JSON object.' });
  }
  const eventCount = await redis.rpush(`run:${runId}`, event);
  if (eventCount === 1) {
    await Promise.all([
      redis.sadd('runs', runId),
      redis.hset(`run:${runId}:meta`, {
        tester,
        proto,
        commit,
        startedAt: new Date().toISOString(),
      }),
    ]);
  } else if (tester !== 'anonymous') {
    // The first event fires at page load, before a player has typed a name,
    // so a named event later in the run claims the whole run.
    await redis.hset(`run:${runId}:meta`, { tester });
  }
  return json(200, { ok: true, eventCount });
}

export async function GET(request: Request): Promise<Response> {
  const redis = redisFromEnv();
  if (redis === null) {
    return json(503, { error: 'The log store is not configured.' });
  }
  const readToken = process.env.LOG_READ_TOKEN;
  if (
    readToken !== undefined &&
    readToken !== '' &&
    request.headers.get('authorization') !== `Bearer ${readToken}`
  ) {
    return json(401, { error: 'Reading runs needs the bearer token.' });
  }
  const runId = new URL(request.url).searchParams.get('runId');
  if (runId === null) {
    const runIds = await redis.smembers('runs');
    const metas = await Promise.all(
      runIds.map((id) => redis.hgetall(`run:${id}:meta`)),
    );
    const runs = runIds.map((id, index) => ({
      runId: id,
      meta: metas[index] ?? null,
    }));
    return json(200, { runs });
  }
  if (!RUN_ID.test(runId)) {
    return json(400, { error: 'runId is not a run id.' });
  }
  const [meta, events] = await Promise.all([
    redis.hgetall(`run:${runId}:meta`),
    redis.lrange<Record<string, unknown>>(`run:${runId}`, 0, -1),
  ]);
  if (meta === null && events.length === 0) {
    return json(404, { error: 'No such run.' });
  }
  return json(200, { runId, meta, events });
}
