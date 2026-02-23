import fs from 'fs';
import path from 'path';

// Define the mappings
const SIZE_MAP = {
    'text-xs': '12',
    'text-sm': '14',
    'text-base': '16',
    'text-lg': '18',
    'text-xl': '20',
    'text-2xl': '24',
    'text-3xl': '30',
    'text-[11px]': '11',
};

const WEIGHT_MAP = {
    'font-normal': 'regular',
    'font-medium': 'medium',
    'font-semibold': 'semibold',
    'font-bold': 'bold',
};

// Generate CSS for missing Typo classes
const SIZES = [30, 24, 20, 18, 16, 14, 12, 11];
const WEIGHTS = [
    { name: 'bold', value: 700 },
    { name: 'semibold', value: 600 },
    { name: 'medium', value: 500 },
    { name: 'regular', value: 400 },
];

function generateCSS() {
    let css = '\n  /* Automatically Generated Typography Classes */\n';
    for (const size of SIZES) {
        let lineHeight = '100%';
        if (size === 12) lineHeight = '16px';
        if (size === 14) lineHeight = '24px';
        if (size === 16) lineHeight = '24px';
        if (size === 18) lineHeight = '28px';
        if (size === 20) lineHeight = '28px';
        if (size === 24) lineHeight = '32px';
        if (size === 30) lineHeight = '36px';

        css += `  /* ${size}px Size */\n`;
        for (const weight of WEIGHTS) {
            css += `  .typo-${weight.name}-${size} {\n`;
            css += `    font-family: var(--font-inter), sans-serif !important;\n`;
            css += `    font-weight: ${weight.value} !important;\n`;
            css += `    font-style: normal;\n`;
            css += `    font-size: ${size}px !important;\n`;
            css += `    line-height: ${lineHeight} !important;\n`;
            css += `    letter-spacing: 0px !important;\n`;
            css += `  }\n`;
        }
    }
    return css;
}

function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx'))) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Regex to match className attributes and strings within cn()
    // We'll replace matching classes using a replacer function
    const classRegex = /(className(?:={|=")|cn\()([\s\S]*?)(?:}|"|\))/g;

    content = content.replace(classRegex, (match, prefix, classString) => {
        let newClassString = classString;

        // Detect size
        let matchedSize = null;
        let fallbackSize = '14'; // default fallback size if font-weight is specified without a size

        for (const [tailwindSize, typoSize] of Object.entries(SIZE_MAP)) {
            if (new RegExp(`\\b${tailwindSize.replace('[', '\\[').replace(']', '\\]')}\\b`).test(newClassString)) {
                matchedSize = typoSize;
                newClassString = newClassString.replace(new RegExp(`\\b${tailwindSize.replace('[', '\\[').replace(']', '\\]')}\\b`, 'g'), '');
                break; // take the first size matched
            }
        }

        // Detect weight
        let matchedWeight = null;
        let fallbackWeight = 'regular'; // default to regular if weight not specified

        for (const [tailwindWeight, typoWeight] of Object.entries(WEIGHT_MAP)) {
            if (new RegExp(`\\b${tailwindWeight}\\b`).test(newClassString)) {
                matchedWeight = typoWeight;
                newClassString = newClassString.replace(new RegExp(`\\b${tailwindWeight}\\b`, 'g'), '');
                break; // take the first weight matched
            }
        }

        if (matchedSize || matchedWeight) {
            const finalSize = matchedSize || fallbackSize;
            const finalWeight = matchedWeight || fallbackWeight;
            const typoClass = `typo-${finalWeight}-${finalSize}`;

            // Remove double spaces introduced by removing words
            newClassString = newClassString.replace(/\s+/g, ' ').trim();

            // Append the new typo class
            // To strictly match prefix style, we append it safely
            newClassString = newClassString ? `${newClassString} ${typoClass}` : typoClass;
            modified = true;
        }

        return `${prefix}${newClassString}${match.slice(-1)}`; // Keep original closing char
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

// 1. Update globals.css with new Typography Expansion
const globalsPath = path.join(__dirname, '../src/app/globals.css');
if (fs.existsSync(globalsPath)) {
    let cssContent = fs.readFileSync(globalsPath, 'utf8');

    // We will append the generated classes to utilities layer
    // But clear older typo definitions to avoid conflicts or just append if they are overriding.
    // Actually, to make it safe, we'll strip out the old typo-* block if we want or just let standard CSS cascade.
    console.log('Generating expanded CSS rules...');

    // Simple injection before the closing brace of @layer utilities
    cssContent = cssContent.replace(/}\n*$/, generateCSS() + '\n}\n');
    fs.writeFileSync(globalsPath, cssContent);
    console.log('Successfully injected typography expansion into globals.css');
}

// 2. Process the React files
const rootDir = path.join(__dirname, '../src');
console.log('Starting typography scan and replace across src/...');
processDirectory(rootDir);
console.log('Migration complete!');
