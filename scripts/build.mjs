import { cp, mkdir, mkdtemp, rename, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const staging = await mkdtemp(join(root, '.build-'));
try {
  await mkdir(join(staging, 'src'));
  for (const name of ['engine.js', 'element.js', 'sources.js', 'catalog.js', 'geomancy.js', 'legacy-v1.js', 'legacy-v2.js', 'ornament.js', 'workshop.css']) {
    await cp(join(root, 'src', name), join(staging, 'src', name));
  }
  for (const name of ['_headers', '404.html']) {
    await cp(join(root, 'public', name), join(staging, name));
  }
  await cp(join(root, 'index.html'), join(staging, 'index.html'));
  await rm(join(root, 'dist'), { recursive: true, force: true });
  await rename(staging, join(root, 'dist'));
  console.log('Built dist/: workshop, modules and static headers.');
} finally {
  await rm(staging, { recursive: true, force: true });
}
