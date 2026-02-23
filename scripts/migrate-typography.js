import fs from 'fs';
import path from 'path';

// Define the mappings
const SIZE_MAP = {
    'text-\\[11px\\]': '11',
    'text-xs': '12',
    'text-sm': '14',
    'text-base': '16',
    'text-lg': '18',
    'text-xl': '20',
    'text-2xl': '24',
    'text-3xl': '30',
    'text-4xl': '36',
    'text-5xl': '48',
};

const WEIGHT_MAP = {
    'font-normal': 'regular',
    'font-medium': 'medium',
    'font-semibold': 'semibold',
    'font-bold': 'bold',
    'font-extrabold': 'bold',
    'font-black': 'bold',
};

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
    let originalContent = content;

    // We find all string literals: "...", '...', or `...`
    // And we use the 's' flag so . matches newlines.
    const stringLiteralRegex = /(["'`])(?:(?=(\\?))\2.)*?\1/gs;

    content = content.replace(stringLiteralRegex, (match) => {
        let newStr = match;

        // Check if there is a match for our specific sizes or weights 
        // BUT we must avoid hover:, focus:, sm:, lg:, etc.
        let hasSize = false;
        let hasWeight = false;

        // A valid class should be preceded by a quote, start of line, a space, or a backtick/quote
        const classBoundaryPrefix = `(^|["'\`]|\\s)`;

        for (const twClass of Object.keys(SIZE_MAP)) {
            if (new RegExp(`${classBoundaryPrefix}${twClass}\\b`).test(newStr)) hasSize = true;
        }
        for (const twClass of Object.keys(WEIGHT_MAP)) {
            if (new RegExp(`${classBoundaryPrefix}${twClass}\\b`).test(newStr)) hasWeight = true;
        }

        if (!hasSize && !hasWeight) return match; // Nothing to do

        // We have a match! Let's extract the first size and weight we find.
        let matchedSize = null;
        let matchedWeight = null;

        for (const [tailwindSize, typoSize] of Object.entries(SIZE_MAP)) {
            const regex = new RegExp(`${classBoundaryPrefix}${tailwindSize}\\b`, 'g');
            // If found, capture it and replace it with just the prefix so we don't eat the preceding space or quote
            if (regex.test(newStr)) {
                if (!matchedSize) matchedSize = typoSize;
                newStr = newStr.replace(regex, '$1');
            }
        }

        for (const [tailwindWeight, typoWeight] of Object.entries(WEIGHT_MAP)) {
            const regex = new RegExp(`${classBoundaryPrefix}${tailwindWeight}\\b`, 'g');
            if (regex.test(newStr)) {
                if (!matchedWeight) matchedWeight = typoWeight;
                newStr = newStr.replace(regex, '$1');
            }
        }

        // Default weight is regular if size is present but weight is not.
        // Default size is 14 if weight is present but size is not.
        const finalSize = matchedSize || '14';
        const finalWeight = matchedWeight || 'regular';
        const typoClass = `typo-${finalWeight}-${finalSize}`;

        // Clean up multiple spaces that might have been left behind inside the string, 
        // removing spaces without affecting the enclosing quotes if possible.
        const quoteChar = newStr[0];
        const endQuoteChar = newStr[newStr.length - 1]; // could be the same as quoteChar, but maybe `

        // We get the inner content
        let innerContent = newStr.slice(1, -1);

        // replace double spaces with single space
        innerContent = innerContent.replace(/\s+/g, ' ').trim();

        return `${quoteChar}${innerContent ? innerContent + ' ' : ''}${typoClass}${endQuoteChar}`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

// 2. Process the React files
const rootDir = path.join(import.meta.dirname, '../src');
console.log('Starting explicit typography sweep over all strings...');
processDirectory(rootDir);
console.log('Sweep complete!');
