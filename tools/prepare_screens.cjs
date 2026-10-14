/* Convert the unedited engine captures to web assets without changing their content. */
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'assets', 'screens');
(async () => {
  for (const file of fs.readdirSync(root).filter(name => name.endsWith('.png'))) {
    const input = path.join(root, file);
    const output = input.replace(/\.png$/, '.webp');
    await sharp(input).webp({ quality: 90, effort: 6 }).toFile(output);
    console.log(path.basename(output), fs.statSync(output).size);
  }
})();
