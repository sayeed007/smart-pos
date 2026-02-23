import fs from 'fs';
import path from 'path';

let css = fs.readFileSync(path.join(import.meta.dirname, '../src/app/globals.css'), 'utf8');

const SIZES = [36, 48, 60, 72, 96, 128];
const WEIGHTS = [
    { name: 'bold', value: 700 },
    { name: 'semibold', value: 600 },
    { name: 'medium', value: 500 },
    { name: 'regular', value: 400 },
];

let generatedCSS = '\n  /* Extra Large Sizes */\n';
for (const size of SIZES) {
    let lineHeight = '100%';
    generatedCSS += `  /* ${size}px Size */\n`;
    for (const weight of WEIGHTS) {
        generatedCSS += `  .typo-${weight.name}-${size} {
    font-family: var(--font-inter), sans-serif !important;
    font-weight: ${weight.value} !important;
    font-style: normal;
    font-size: ${size}px !important;
    line-height: ${lineHeight} !important;
    letter-spacing: 0px !important;
  }\n`;
    }
}

css = css.replace(/\n}\n*$/, generatedCSS + '\n}\n');
fs.writeFileSync(path.join(import.meta.dirname, '../src/app/globals.css'), css, 'utf8');
console.log('Added huge typo classes to globals.css');
