# i18n Translation Checker

## Overview

This script validates that all translation files across different locales have matching keys. It helps ensure consistency in internationalization (i18n) across your application.

## Usage

Run the validation script:

```bash
npm run check-i18n
```

## What It Does

The script:

1. **Scans all locale directories** (e.g., `en`, `bn`, `fr`, etc.)
2. **Compares translation files** across locales
3. **Validates key consistency**:
   - Checks if all files exist in all locales
   - Verifies all translation keys match across locales
   - Detects missing keys
   - Detects extra keys
4. **Reports results** with colored output:
   - ✅ Green: All keys match
   - ❌ Red: Missing keys or files
   - ⚠️  Yellow: Extra keys (warnings)

## Output Examples

### Success ✅

```
🔍 Checking i18n translations...

📂 Found locales: en, bn

📄 Found 9 translation files

📝 Checking inventory.json...
  ℹ️  Reference (en): 60 keys
  ✅ bn: 60 keys (match)

============================================================

✅ All translations are valid!
   All locales have matching keys and files.

============================================================
```

### Failure ❌

```
📝 Checking inventory.json...
  ℹ️  Reference (en): 60 keys
  ❌ Missing in bn/inventory.json:
     - tabs.ledger
     - tabs.transfers
     - transactionTypes.in

============================================================

❌ Translation validation FAILED!

3 error(s) found:
```

## Key Features

- **Deep nested key checking**: Validates nested JSON structures (e.g., `stats.totalProducts`)
- **Multiple locale support**: Can handle any number of locales
- **File existence check**: Ensures all translation files exist in all locales
- **Colored output**: Easy-to-read console output with colors
- **Exit codes**: Returns 0 on success, 1 on failure (CI/CD friendly)

## Integration with CI/CD

Add to your CI pipeline to prevent merging code with incomplete translations:

```yaml
# .github/workflows/ci.yml
- name: Check i18n translations
  run: npm run check-i18n
```

## Directory Structure

The script expects translations in this structure:

```
src/i18n/locales/
├── en/
│   ├── common.json
│   ├── products.json
│   └── inventory.json
├── bn/
│   ├── common.json
│   ├── products.json
│   └── inventory.json
└── [other locales]/
```

## Common Issues

### Missing Translation Keys

**Problem:** A locale is missing some translation keys

**Solution:** Add the missing keys to the locale file. The script will tell you exactly which keys are missing.

### Extra Keys

**Problem:** A locale has keys that don't exist in the reference locale

**Solution:** Either add those keys to other locales or remove them if they're not needed.

### Missing Files

**Problem:** A translation file exists in one locale but not in another

**Solution:** Create the missing file in all locales with all required keys.

## Script Internals

### How It Works

1. Uses the **first locale alphabetically** as the reference
2. Loads all JSON files from the reference locale
3. For each file:
   - Extracts all nested keys into a flat array
   - Compares with the same file in other locales
   - Reports any differences
4. Checks for missing files in non-reference locales

### Key Comparison

The script converts nested objects into dot-notation paths:

```json
{
  "stats": {
    "total": "Total",
    "active": "Active"
  }
}
```

Becomes:
```
stats.total
stats.active
```

This allows for precise key-by-key comparison.

## Troubleshooting

### Script doesn't run

Make sure Node.js is installed:
```bash
node --version
```

### Can't find locales directory

The script looks for: `src/i18n/locales/`

Ensure your project structure matches this path.

### Wrong locale order

The first locale (alphabetically) is used as reference. If you want a specific locale as reference, you can modify the script or rename your locale directories.

## Maintenance

When adding new translation keys:

1. Add to **all locales** simultaneously
2. Run `npm run check-i18n` to verify
3. Fix any reported issues before committing

## Future Enhancements

Potential improvements:
- Specify reference locale via CLI argument
- JSON schema validation
- Detect unused translation keys (dead keys)
- Auto-fix mode to sync keys
- Support for plural forms validation
- Translation coverage report

---

**Last Updated:** 2026-02-13
