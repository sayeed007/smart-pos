#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function getTranslationFiles(localeDir) {
    const files = fs.readdirSync(localeDir);
    return files.filter(file => file.endsWith('.json'));
}

function getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            keys = keys.concat(getAllKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys.sort();
}

function loadTranslation(locale, file) {
    const filePath = path.join(LOCALES_DIR, locale, file);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

function validateTranslations() {
    log('\n🔍 Checking i18n translations...\n', 'cyan');

    // Get all available locales
    const locales = fs.readdirSync(LOCALES_DIR).filter(item => {
        return fs.statSync(path.join(LOCALES_DIR, item)).isDirectory();
    });

    if (locales.length === 0) {
        log('❌ No locales found!', 'red');
        process.exit(1);
    }

    log(`📂 Found locales: ${locales.join(', ')}\n`, 'blue');

    // Use 'en' as reference if available, otherwise use first
    let referenceLocale = 'en';
    if (!locales.includes(referenceLocale)) {
        referenceLocale = locales[0];
    }
    const translationFiles = getTranslationFiles(path.join(LOCALES_DIR, referenceLocale));

    log(`📄 Found ${translationFiles.length} translation files\n`, 'blue');

    let hasErrors = false;
    const errors = [];

    // Check each translation file
    for (const file of translationFiles) {
        log(`\n📝 Checking ${file}...`, 'cyan');

        // Load reference translation
        const referenceTranslation = loadTranslation(referenceLocale, file);
        if (!referenceTranslation) {
            log(`  ⚠️  Could not load reference file from ${referenceLocale}`, 'yellow');
            continue;
        }

        const referenceKeys = getAllKeys(referenceTranslation);
        log(`  ℹ️  Reference (${referenceLocale}): ${referenceKeys.length} keys`, 'blue');

        // Check all other locales
        for (const locale of locales) {
            if (locale === referenceLocale) continue;

            const translation = loadTranslation(locale, file);

            if (!translation) {
                hasErrors = true;
                const error = `  ❌ Missing file: ${locale}/${file}`;
                log(error, 'red');
                errors.push(error);
                continue;
            }

            const localeKeys = getAllKeys(translation);

            // Find missing keys
            const missingKeys = referenceKeys.filter(key => !localeKeys.includes(key));
            const extraKeys = localeKeys.filter(key => !referenceKeys.includes(key));

            if (missingKeys.length > 0 || extraKeys.length > 0) {
                hasErrors = true;

                if (missingKeys.length > 0) {
                    const error = `  ❌ Missing in ${locale}/${file}:`;
                    log(error, 'red');
                    errors.push(error);
                    missingKeys.forEach(key => {
                        const keyError = `     - ${key}`;
                        log(keyError, 'red');
                        errors.push(keyError);
                    });
                }

                if (extraKeys.length > 0) {
                    const warning = `  ⚠️  Extra keys in ${locale}/${file}:`;
                    log(warning, 'yellow');
                    extraKeys.forEach(key => {
                        log(`     - ${key}`, 'yellow');
                    });
                }
            } else {
                log(`  ✅ ${locale}: ${localeKeys.length} keys (match)`, 'green');
            }
        }
    }

    // Check for missing files in other locales
    log('\n\n🔍 Checking for missing translation files...\n', 'cyan');

    for (const locale of locales) {
        if (locale === referenceLocale) continue;

        const localeFiles = getTranslationFiles(path.join(LOCALES_DIR, locale));
        const missingFiles = translationFiles.filter(file => !localeFiles.includes(file));

        if (missingFiles.length > 0) {
            hasErrors = true;
            log(`❌ Missing files in ${locale}:`, 'red');
            missingFiles.forEach(file => {
                const error = `   - ${file}`;
                log(error, 'red');
                errors.push(`Missing file in ${locale}: ${file}`);
            });
        }
    }

    // Print summary
    log('\n' + '='.repeat(60), 'blue');
    if (hasErrors) {
        log('\n❌ Translation validation FAILED!', 'red');
        log(`\n${errors.length} error(s) found:\n`, 'red');
        process.exit(1);
    } else {
        log('\n✅ All translations are valid!', 'green');
        log('   All locales have matching keys and files.', 'green');
        log('\n' + '='.repeat(60) + '\n', 'blue');
        process.exit(0);
    }
}

// Run validation
validateTranslations();
