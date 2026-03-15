import sharp from 'sharp'
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const srcSvg = join(root, 'src', 'assets', 'logo.svg')
const outDir = join(root, 'public', 'icons')

const sizes = [192, 512]

if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true })
}

const svg = readFileSync(srcSvg)

for (const size of sizes) {
    await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(join(outDir, `icon-${size}x${size}.png`))
    await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(join(outDir, `icon-maskable-${size}x${size}.png`))
}

console.log('PWA icons generated in public/icons/')
