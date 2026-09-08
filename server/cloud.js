const key = 'daru_workspace:state_v1';

export function createCloudStore(env = process.env, request = fetch) {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  const configured = Boolean(url && token);
  async function command(args) {
    const response = await request(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Cloud HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error('Cloud menolak penyimpanan.');
    return data.result;
  }
  let writes = Promise.resolve();
  return {
    configured,
    async load() {
      if (!configured) return null;
      const result = await command(['GET', key]);
      return result ? JSON.parse(result) : null;
    },
    save(state) {
      if (!configured) return Promise.resolve(false);
      const payload = JSON.stringify(state);
      const pending = writes.catch(() => {}).then(async () => {
        if (await command(['SET', key, payload]) !== 'OK') throw new Error('Cloud tidak mengonfirmasi penyimpanan.');
        return true;
      });
      writes = pending;
      return pending;
    },
  };
}
