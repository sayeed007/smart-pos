const fs = require('fs');
const path = require('path');
const out = fs.readFileSync('missing.txt', 'utf8');
const lines = out.split('\n');
const missingDict = {};

// Clean way to strip ANSI escape codes safely cross-platform
function stripAnsi(text) {
    return text.replace(/\x1B\[\d+m/gi, '');
}

for (let line of lines) {
    line = stripAnsi(line);
    if (line.includes('Namespace:')) {
        const match = line.match(/Namespace:\s*([^ ]+)\s*\|\s*Key:\s*"(.*?)"/);
        if (match) {
            const ns = match[1];
            const keyPath = match[2];
            if (!missingDict[ns]) missingDict[ns] = [];
            if (!missingDict[ns].includes(keyPath)) {
                missingDict[ns].push(keyPath);
            }
        }
    }
}

// Correct path resolution starting from two directories up inside "scripts"
const enDir = path.join(__dirname, '../src/i18n/locales/en');
const bnDir = path.join(__dirname, '../src/i18n/locales/bn');

function setNested(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
    }
    if (current[parts[parts.length - 1]] === undefined) {
        current[parts[parts.length - 1]] = value;
    }
}

for (const ns of Object.keys(missingDict)) {
    const enFile = path.join(enDir, ns + '.json');
    const bnFile = path.join(bnDir, ns + '.json');

    if (!fs.existsSync(enFile)) {
        fs.writeFileSync(enFile, '{}');
    }
    if (!fs.existsSync(bnFile)) {
        fs.writeFileSync(bnFile, '{}');
    }

    const enObj = JSON.parse(fs.readFileSync(enFile, 'utf8'));
    const bnObj = JSON.parse(fs.readFileSync(bnFile, 'utf8'));

    console.log('Fixing namespace:', ns);

    for (const keyPath of missingDict[ns]) {
        console.log('  Adding:', keyPath);
        // Create English placeholder readable strings
        let valEn = keyPath.split('.').pop();
        // Special translations exceptions that we have seen so far
        const translationExceptions = {
            'toasts.deleteSuccess': 'Deleted successfully',
            'toasts.deleteError': 'Failed to delete',
            'toasts.updateSuccess': 'Updated successfully',
            'toasts.updateError': 'Failed to update',
            'toasts.createSuccess': 'Created successfully',
            'toasts.createError': 'Failed to create',
            'fields.name': 'Name',
            'fields.type': 'Type',
            'fields.status': 'Status',
            'fields.address': 'Address',
            'headers.name': 'Name',
            'headers.type': 'Type',
            'headers.address': 'Address',
            'headers.status': 'Status',
            'headers.actions': 'Actions',
            'actions.addLocation': 'Add Location',
            'actions.cancel': 'Cancel',
            'actions.update': 'Update',
            'actions.save': 'Save',
            'dialog.editTitle': 'Edit',
            'dialog.addTitle': 'Add',
            'dialog.deleteTitle': 'Delete'
        };

        if (translationExceptions[keyPath]) {
            valEn = translationExceptions[keyPath];
        } else {
            // Automatic Camel case to sentence spacing with capital first letter
            valEn = valEn.replace(/([A-Z])/g, ' $1');
            valEn = valEn.charAt(0).toUpperCase() + valEn.slice(1);
        }

        setNested(enObj, keyPath, valEn);
        // Create Bengali placeholder
        setNested(bnObj, keyPath, '[EN] ' + valEn);
    }

    fs.writeFileSync(enFile, JSON.stringify(enObj, null, 2));
    fs.writeFileSync(bnFile, JSON.stringify(bnObj, null, 2));
}
console.log('\nDone applying missing translations.');
