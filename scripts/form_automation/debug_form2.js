const fs = require('fs');
const raw = fs.readFileSync('form_data2.json', 'utf8');
const data = JSON.parse(raw);

const items = data[1][1];
const out = [];

items.forEach((q, i) => {
    out.push('--- Item ' + i + ' ---');
    out.push(JSON.stringify(q));
    out.push('');
});

fs.writeFileSync('all_questions.json', out.join('\n'), 'utf8');
console.log('Written');
