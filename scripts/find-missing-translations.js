const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const EN_DIR = path.join(__dirname, '../src/i18n/locales/en');

// 1. Load all reference namespaces (English)
const namespaces = {};
if (!fs.existsSync(EN_DIR)) {
    console.error(`Error: Locales directory not found at ${EN_DIR}`);
    process.exit(1);
}

const enFiles = fs.readdirSync(EN_DIR).filter(f => f.endsWith('.json'));
for (const file of enFiles) {
    const ns = file.replace('.json', '');
    namespaces[ns] = JSON.parse(fs.readFileSync(path.join(EN_DIR, file), 'utf8'));
}

// Utility to safely retrieve a nested property
function getNestedValue(obj, pathParts) {
    let current = obj;
    for (const part of pathParts) {
        if (current === undefined || current === null) return undefined;
        current = current[part];
    }
    return current;
}

// Utility to recursively find files
function getAllFiles(dir, exts, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, exts, fileList);
        } else if (exts.some(ext => fullPath.endsWith(ext))) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

console.log("🔍 Scanning source files for translation keys...");
const files = getAllFiles(SRC_DIR, ['.ts', '.tsx', '.js', '.jsx']);
let missingKeys = [];

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');

    // A. Determine default namespaces used in the file via useTranslation()
    let defaultNamespaces = ['common']; // Fallback

    // Match: useTranslation("ns") OR useTranslation(["ns1", "ns2"])
    const useTranslationMatch = content.match(/useTranslation\(\s*(?:\[\s*([^\]]+)\s*\]|(['"`])(.*?)\2)\s*\)/);
    if (useTranslationMatch) {
        if (useTranslationMatch[1]) {
            // Array form
            const matches = useTranslationMatch[1].match(/(['"`])(.*?)\1/g);
            if (matches) {
                defaultNamespaces = matches.map(m => m.replace(/['"`]/g, '').trim());
            }
        } else if (useTranslationMatch[3]) {
            // String form
            defaultNamespaces = [useTranslationMatch[3].trim()];
        }
    }

    // B. Find all t("...") or t('...')
    // Looks for word boundary, "t", parenthesis, then a string literal
    const tRegex = /(?:[^\w]|^)t\(\s*(['"`])(.*?)\1/g;
    let tMatch;
    while ((tMatch = tRegex.exec(content)) !== null) {
        const fullKey = tMatch[2];

        // Skip dynamic keys containing concatenation or template literals
        if (fullKey.includes('${') || fullKey.endsWith('.')) {
            continue;
        }

        let ns = defaultNamespaces[0];
        let keyPath = fullKey;

        // Handle inline namespace overrides: t("namespace:key.path")
        if (fullKey.includes(':')) {
            const parts = fullKey.split(':');
            ns = parts[0];
            keyPath = parts.slice(1).join(':');
        }

        let found = false;

        // First try the matched/explicit namespace
        if (namespaces[ns] && getNestedValue(namespaces[ns], keyPath.split('.')) !== undefined) {
            found = true;
        }

        // If not found, try any other default namespaces imported in the file
        if (!found) {
            for (const dNs of defaultNamespaces) {
                if (namespaces[dNs] && getNestedValue(namespaces[dNs], keyPath.split('.')) !== undefined) {
                    ns = dNs; // Update `ns` to the correct one so it gets logged properly if we ever expand this script
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            // It's genuinely missing
            missingKeys.push({ file: path.relative(__dirname, file), fullKey, ns, keyPath });
        }
    }
}

// 3. Deduplicate and group missing keys
const uniqueMissing = {};
for (const item of missingKeys) {
    const k = `${item.ns}:${item.keyPath}`;
    if (!uniqueMissing[k]) {
        uniqueMissing[k] = { ns: item.ns, keyPath: item.keyPath, files: new Set() };
    }
    uniqueMissing[k].files.add(item.file);
}

// 4. Output results
const missingCount = Object.keys(uniqueMissing).length;

if (missingCount === 0) {
    console.log("\n✅ All source keys exist in the 'en' translation files!");
} else {
    console.log(`\n❌ Found ${missingCount} missing keys in the 'en' translation files:\n`);
    for (const k in uniqueMissing) {
        const info = uniqueMissing[k];
        console.log(`Namespace: \x1b[36m${info.ns}\x1b[0m | Key: \x1b[33m"${info.keyPath}"\x1b[0m`);
        for (const f of info.files) {
            console.log(`  - ${f}`);
        }
        console.log();
    }
}

// Exit with an error code if there are missing keys (useful for CI/CD)
if (missingCount > 0) {
    process.exit(1);
}
