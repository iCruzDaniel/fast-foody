/**
 * Assembles Vercel's Build Output API structure after esbuild bundles the
 * Express app.
 *
 * The backend uses TypeScript path aliases (@domain/*, @shared/*,
 * @application/*) that Vercel's node runtime cannot resolve, so esbuild must
 * bundle the app first. The bundle is emitted into the Build Output API layout
 * (.vercel/output/functions/api.func/) with a .vc-config.json whose
 * `handler: "index.default"` makes Vercel auto-wrap the default-export Express
 * app as a serverless function. Routing in config.json sends every non-static
 * path to the /api function while still serving static assets (handle:
 * filesystem).
 *
 * This file is committed so Vercel runs it via buildCommand; the generated
 * .vercel/output directory is gitignored.
 */

const fs = require('node:fs')
const path = require('node:path')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.join(ROOT, '.vercel', 'output')
const FUNC_DIR = path.join(OUTPUT_DIR, 'functions', 'api.func')

/** Bundle produced by the `build:vercel` esbuild step. */
const BUNDLE_SOURCE = path.join(ROOT, 'dist', 'index.cjs')
const HANDLER_FILE = 'index.js'

function assertBundleExists() {
  if (!fs.existsSync(BUNDLE_SOURCE)) {
    throw new Error(
      `Bundle not found at ${BUNDLE_SOURCE}. Run "npm run build:vercel" first.`
    )
  }
}

function clean() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
}

function writeFunction() {
  fs.mkdirSync(FUNC_DIR, { recursive: true })
  // Copy the CJS bundle into the function directory so it is included in the
  // serverless function payload. Named index.js so the .vc-config.json handler
  // ("index.default") resolves to the default-exported Express app.
  fs.copyFileSync(BUNDLE_SOURCE, path.join(FUNC_DIR, HANDLER_FILE))

  // Node.js serverless function config. `handler: "index.default"` +
  // launcherType Nodejs makes Vercel wrap the default-exported Express app.
  fs.writeFileSync(
    path.join(FUNC_DIR, '.vc-config.json'),
    JSON.stringify(
      {
        runtime: 'nodejs20.x',
        handler: 'index.default',
        launcherType: 'Nodejs',
        shouldAddHelpers: false,
        shouldAddSourcemapSupport: false,
      },
      null,
      2
    )
  )
}

function writeConfig() {
  // version 3 is required by the Build Output API. CORS is handled entirely by
  // the Express app's own `cors()` middleware (mounted in container.ts), so the
  // edge only lets the filesystem serve static assets first, then sends every
  // remaining path to the /api function (which holds the bundled Express app).
  // No Access-Control-* headers are set at the edge here: for credentialed
  // requests the browser needs the exact origin echoed back (which Express does),
  // and a wildcard "*" from the edge would conflict with it.
  const config = {
    version: 3,
    routes: [
      { handle: 'filesystem' },
      { src: '/api/(.*)', dest: '/api' },
    ],
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'config.json'), JSON.stringify(config, null, 2))
}

function main() {
  assertBundleExists()
  clean()
  writeFunction()
  writeConfig()
  const funcDir = path.relative(ROOT, FUNC_DIR)
  console.log(`[vercel-output] wrote ${funcDir}/`)
  console.log(`[vercel-output] wrote ${path.relative(ROOT, path.join(OUTPUT_DIR, 'config.json'))}`)
}

main()