const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_PAGES_PROJECT: project } = process.env;
if (!token || !/^[a-f0-9]{32}$/.test(account ?? '') || !/^[a-z0-9][a-z0-9-]{0,62}$/.test(project ?? '')) {
  throw new Error('Missing or invalid Cloudflare deployment settings');
}
const base = `https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const response = await fetch(`${base}/${project}`, { headers, signal: AbortSignal.timeout(30000) });
const existing = await response.json();
if (response.ok && existing.success) {
  if (existing.result.production_branch !== 'main') throw new Error('Existing Pages project must use main as its production branch');
  if (existing.result.source) throw new Error('Existing project has Git integration; review it before enabling a second deployment flow');
  console.log(`Pages project ${project} is ready`);
} else if (response.status === 404) {
  const created = await fetch(base, {
    method: 'POST', headers,
    body: JSON.stringify({ name: project, production_branch: 'main' }),
    signal: AbortSignal.timeout(30000),
  });
  const result = await created.json();
  if (!created.ok || !result.success) throw new Error(`Pages project creation failed (HTTP ${created.status})`);
  console.log(`Created Pages project ${project}`);
} else {
  throw new Error(`Cannot inspect Pages project (HTTP ${response.status}); check token permissions and account`);
}
