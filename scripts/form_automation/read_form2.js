const fs = require('fs');
const raw = fs.readFileSync('form_data2.json', 'utf8');
const data = JSON.parse(raw);

const output = [];
const sections = [];
let currentSection = null;

const items = data[1][1];

items.forEach((q) => {
    if (q[3] === 8) {
        // Section header
        if (currentSection) sections.push(currentSection);
        currentSection = { title: String(q[1] || ''), questions: [] };
    } else {
        if (!currentSection) currentSection = { title: 'Section 1', questions: [] };
        const title = String(q[1] || '');
        const type = q[3];
        let entryId = null;
        let options = [];
        if (q[4] && Array.isArray(q[4])) {
            q[4].forEach(field => {
                if (field && field[1] !== undefined && field[1] !== null) {
                    entryId = field[1];
                }
                if (field && field[2] && Array.isArray(field[2])) {
                    options = field[2].map(o => String(o[0] || ''));
                }
            });
        }
        currentSection.questions.push({ title, type, entryId, options });
    }
});
if (currentSection) sections.push(currentSection);

sections.forEach((sec, si) => {
    output.push('========== SECTION ' + (si + 1) + ': ' + sec.title + ' ==========');
    sec.questions.forEach((q, qi) => {
        output.push('  Q' + (qi + 1) + ': ' + q.title);
        output.push('       Type: ' + q.type + '  |  EntryID: entry.' + q.entryId);
        if (q.options.length > 0) {
            output.push('       Options: ' + q.options.join(' | '));
        }
        output.push('');
    });
    output.push('');
});

const result = output.join('\n');
fs.writeFileSync('form_questions2.txt', result, 'utf8');
process.stdout.write(result);
