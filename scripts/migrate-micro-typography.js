import fs from 'fs';
import path from 'path';

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

    // We find all string literals
    const stringLiteralRegex = /(["'`])(?:(?=(\\?))\2.)*?\1/gs;

    content = content.replace(stringLiteralRegex, (match) => {
        let newStr = match;
        let modified = false;

        // Detect if we have any of our target arbitrary sizes
        const has10 = /text-\[10px\]/.test(newStr);
        const has11 = /text-\[11px\]/.test(newStr);
        const has08rem = /text-\[0\.8rem\]/.test(newStr);

        if (!has10 && !has11 && !has08rem) return match;

        // Remove them
        newStr = newStr.replace(/text-\[10px\]\s*/g, '');
        newStr = newStr.replace(/text-\[11px\]\s*/g, '');
        newStr = newStr.replace(/text-\[0\.8rem\]\s*/g, '');

        // Check if there is already a typo- class.
        // If so, we just update the size suffix to 10, 11, or 13.
        const typoMatch = newStr.match(/typo-(bold|semibold|medium|regular)-(\d+)/);

        let targetSize = has10 ? '10' : has11 ? '11' : '13';

        if (typoMatch) {
            // Replace the existing typo class with the new size
            const oldTypo = typoMatch[0];
            const newTypo = `typo-${typoMatch[1]}-${targetSize}`;
            newStr = newStr.replace(oldTypo, newTypo);
        } else {
            // Append the new typo class
            const quoteChar = newStr[0];
            const endQuoteChar = newStr[newStr.length - 1];
            let innerContent = newStr.slice(1, -1).trim();
            newStr = `${quoteChar}${innerContent ? innerContent + ' ' : ''}typo-regular-${targetSize}${endQuoteChar}`;
        }

        // Clean up multiple spaces
        const quoteChar = newStr[0];
        const endQuoteChar = newStr[newStr.length - 1];
        let finalInner = newStr.slice(1, -1).replace(/\s+/g, ' ').trim();
        return `${quoteChar}${finalInner}${endQuoteChar}`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed overlaps in: ${filePath}`);
    }
}

processDirectory(path.join(import.meta.dirname, '../src'));
console.log('Processed all overlaps for 10px, 11px, 0.8rem');
