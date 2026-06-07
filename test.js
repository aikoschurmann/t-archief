import { createServer } from 'vite';
const server = await createServer({ root: process.cwd() });
const mod = await server.ssrLoadModule('/src/lib/utils/workLoader.ts');
console.log(mod.loadWorks()[0]);
process.exit(0);
