import { defineConfig, type Plugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { cloudflare } from '@cloudflare/vite-plugin'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FREE_WORK } from './src/lib/site'

const WORK_DIR = fileURLToPath(new URL('./src/lib/assets/work', import.meta.url))

type ProjectUpdate = { folder: string; order: number; image_order: string[]; home: string[]; hidden: string[]; visible: boolean; colour: string; free: boolean }

/**
 * Dev-only endpoint behind the #/edit page: merges project order, visibility, dot colour,
 * section (vrij werk), image order, home picks and hidden images into each project's meta.json, keeping any
 * other fields as they are.
 */
function archiveEditor(): Plugin {
  return {
    name: 'archive-editor',
    configureServer(server) {
      server.middlewares.use('/__archive/save', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        let body = ''
        req.on('data', chunk => (body += chunk))
        req.on('end', () => {
          try {
            const { projects } = JSON.parse(body) as { projects: ProjectUpdate[] }
            for (const p of projects) {
              const dir = path.join(WORK_DIR, p.folder)
              // Only write inside existing project folders
              if (path.dirname(dir) !== WORK_DIR || !fs.existsSync(dir)) {
                throw new Error(`Unknown project folder: ${p.folder}`)
              }
              const metaPath = path.join(dir, 'meta.json')
              const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {}
              meta.order = p.order
              meta.image_order = p.image_order
              if (p.home.length) meta.home = p.home
              else delete meta.home
              if (p.hidden.length) meta.hidden = p.hidden
              else delete meta.hidden
              if (p.visible === false) meta.visible = false
              else delete meta.visible
              if (/^#[0-9a-f]{6}$/i.test(p.colour)) meta.colour = p.colour
              else delete meta.colour
              // Only touch the "vrij" section, so any other section value stays as it is
              if (p.free) meta.section = FREE_WORK
              else if (meta.section === FREE_WORK) delete meta.section
              fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n')
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (e) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: String(e) }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), cloudflare(), archiveEditor()],
})
