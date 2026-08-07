#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

const imgDir = './assets/img';

// Konfigurácia optimalizácie pre každý obrázok
const images = {
  'favicon.png': {
    // Favicon ostane 256x256, iba sa bude komprimovať
    formats: ['png']
  },
  'hero-datacenter.png': {
    // Hero background - zmenšiť na 1024x768 (16:9 ratio) a WebP
    resize: { width: 1024, height: 768, fit: 'cover' },
    formats: ['png', 'webp']
  },
  'hero-laptop.png': {
    // Hero background - zmenšiť na 1280x800 a WebP
    resize: { width: 1280, height: 800, fit: 'cover' },
    formats: ['png', 'webp']
  },
  'logo-full.png': {
    // Logo - zmenšiť na 800x412
    resize: { width: 800, height: 412, fit: 'contain' },
    formats: ['png']
  },
  'logo-mark.png': {
    // Logo mark - ponechať ale komprimovať
    formats: ['png']
  }
};

async function optimizeImages() {
  console.log('🖼️  Začínam optimalizáciu obrázkov...\n');

  for (const [filename, config] of Object.entries(images)) {
    const inputPath = path.join(imgDir, filename);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Súbor nenájdený: ${filename}`);
      continue;
    }

    const inputSize = fs.statSync(inputPath).size;
    console.log(`📄 ${filename} (${(inputSize / 1024).toFixed(1)} KB)`);

    try {
      // Optimalizovať PNG
      if (config.formats.includes('png')) {
        const outputPath = inputPath;
        let processor = sharp(inputPath);

        if (config.resize) {
          processor = processor.resize(config.resize.width, config.resize.height, {
            fit: config.resize.fit,
            withoutEnlargement: true
          });
        }

        await processor
          .png({ quality: 85, compressionLevel: 9 })
          .toFile(outputPath + '.tmp');

        fs.renameSync(outputPath + '.tmp', outputPath);
        const outputSize = fs.statSync(outputPath).size;
        console.log(`   ✅ PNG: ${(outputSize / 1024).toFixed(1)} KB (${((1 - outputSize / inputSize) * 100).toFixed(0)}% menšie)`);
      }

      // Vytvoriť WebP verziu
      if (config.formats.includes('webp')) {
        const webpPath = inputPath.replace('.png', '.webp');
        let processor = sharp(inputPath);

        if (config.resize) {
          processor = processor.resize(config.resize.width, config.resize.height, {
            fit: config.resize.fit,
            withoutEnlargement: true
          });
        }

        await processor
          .webp({ quality: 80 })
          .toFile(webpPath);

        const webpSize = fs.statSync(webpPath).size;
        console.log(`   ✅ WebP: ${(webpSize / 1024).toFixed(1)} KB`);
      }
    } catch (error) {
      console.log(`   ❌ Chyba: ${error.message}`);
    }
  }

  // Vymazať .bak súbory
  const bakFile = path.join(imgDir, 'hero-datacenter.png.bak');
  if (fs.existsSync(bakFile)) {
    fs.unlinkSync(bakFile);
    console.log(`\n🗑️  Vymazaný starý backup: hero-datacenter.png.bak`);
  }

  console.log('\n✨ Optimalizácia hotová!');
}

optimizeImages().catch(console.error);
