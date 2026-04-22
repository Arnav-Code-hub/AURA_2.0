
const fs = require('fs');
const html = fs.readFileSync('form_source2.html', 'utf8');

// Extract the FB_PUBLIC_LOAD_DATA_ which contains all form field info
const match = html.match(/FB_PUBLIC_LOAD_DATA_ = ([\s\S]*?);\s*<\/script>/);
if (!match) {
    console.log('Could not find FB_PUBLIC_LOAD_DATA_');
    process.exit(1);
}

let data;
try {
    data = JSON.parse(match[1]);
} catch (e) {
    console.log('JSON parse failed:', e.message);
    // Save raw for inspection
    fs.writeFileSync('form_raw_data.txt', match[1].substring(0, 5000));
    process.exit(1);
}

fs.writeFileSync('form_data2.json', JSON.stringify(data, null, 2));
console.log('Form data extracted successfully, check form_data2.json');

try {
    // Print form title
    if (data[1] && data[1][8]) console.log('Form title:', data[1][8]);

    // Print all questions
    const questions = data[1][1];
    questions.forEach((q, i) => {
        console.log('\n--- Q' + i + ' ---');
        console.log('Title:', q[1]);
        console.log('Type:', q[3]);
        if (q[4] && q[4][0]) {
            if (q[4][0][1] !== undefined) console.log('Entry ID: entry.' + q[4][0][1]);
            if (q[4][0][2] && q[4][0][2].length > 0) {
                console.log('Options:', q[4][0][2].map(o => o[0]).join(' | '));
            }
        }
    });
} catch (e) {
    console.log('Error parsing questions:', e.message);
}
