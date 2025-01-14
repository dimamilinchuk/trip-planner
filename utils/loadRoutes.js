import { readdir } from 'fs/promises';
import path from 'path';

const loadRoutes = async (app) => {
  const routesPath = path.join(process.cwd(), 'routes');

  try {
    const files = await readdir(routesPath);
    for (const file of files) {
      if (file.endsWith('.js')) {
        const route = await import(path.join(routesPath, file));
        const routePath = `/${file.replace('.js', '') === 'index' ? '' : file.replace('.js', '')}`;
        app.use(routePath, route.default);
      }
    }
  } catch (err) {
    console.error('Error loading routes:', err);
  }
};

export default loadRoutes;
