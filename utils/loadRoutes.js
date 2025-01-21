import path from 'path';

import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';

const loadRoutes = async (app) => {
  const routesPath = path.join(process.cwd(), 'routes');
  const relativePath = path.relative(
    path.dirname(fileURLToPath(import.meta.url)),
    routesPath
  );
  try {
    const files = await readdir(routesPath);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const route = await import(
          path.join(relativePath, file).replace(/\\/g, '/')
        );
        const routePath = `/${file.replace('.js', '') === 'index' ? '' : file.replace('.js', '')}`;
        app.use(routePath, route.default);
      }
    }
  } catch (err) {
    console.error('Error loading routes:', err);
  }
};

export default loadRoutes;
