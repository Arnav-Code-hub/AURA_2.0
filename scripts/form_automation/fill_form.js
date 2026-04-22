const https = require('https');
const querystring = require('querystring');

// ─────────────────────────────────────────────────────────────
// Form: "A short study on the impact of memes on public
//        perception and media framing"
// Entry IDs and option values verified from FB_PUBLIC_LOAD_DATA_
// ─────────────────────────────────────────────────────────────

const FORM_SUBMIT_URL = 'docs.google.com';
const FORM_PATH = '/forms/d/e/1FAIpQLSc6PInR772WeY9_vTJmgqWJ01lkkZfiwPgPnaXRl-9LY6Psww/formResponse';

// ── Name pools ───────────────────────────────────────────────
const FIRST_NAMES = [
    'Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Reyansh', 'Krishna', 'Ishaan', 'Shaurya',
    'Aadhya', 'Diya', 'Saanvi', 'Ananya', 'Kiara', 'Pari', 'Riya', 'Myra', 'Aarohi', 'Fatima',
    'Rohan', 'Vikram', 'Rahul', 'Priya', 'Sneha', 'Anjali', 'Neha', 'Pooja', 'Kavita', 'Suresh',
    'Ramesh', 'Deepak', 'Amit', 'Sanjay', 'Karthik', 'Manish', 'Nikhil', 'Abhishek', 'Pranav',
    'Simran', 'Mehak', 'Ayesha', 'Zara', 'Divya', 'Shreya', 'Tanvi', 'Nisha', 'Avni', 'Harsh',
    'Yash', 'Dev', 'Chirag', 'Parth', 'Neel', 'Dhruv', 'Raj', 'Aryan', 'Kabir', 'Ayan',
];
const LAST_NAMES = [
    'Sharma', 'Patel', 'Reddy', 'Singh', 'Kumar', 'Das', 'Gupta', 'Rao', 'Nair', 'Mehta',
    'Jain', 'Iyer', 'Chopra', 'Desai', 'Joshi', 'Bhat', 'Verma', 'Saxena', 'Yadav', 'Khan',
    'Mishra', 'Pandey', 'Chatterjee', 'Acharya', 'Banerjee', 'Dutta', 'Ghosh', 'Agarwal',
    'Tiwari', 'Srivastava', 'Bhatt', 'Menon', 'Pillai', 'Krishnan', 'Nambiar',
];

// ── Exact option values from form (verified via FB_PUBLIC_LOAD_DATA_) ──

// Q2 – Age group
const AGE_GROUPS = ['0-17', '18-24', '25-44', '45 - 60', '60+'];

// Q3 – Gender (last option is blank/"Other" – skip it)
const GENDERS = ['Male', 'Female', 'Prefer not to say'];

// Q4 – Education (last option blank = "Other" – we pick from defined ones)
const EDUCATIONS = [
    'Completed secondary schooling',
    'Completed senior secondary schooling',
    'Diploma/Vocational training',
    "Bachelor's degree",
    "Master's degree",
    'Doctorate',
];

// Q5 – Occupation (last option blank = "Other" – skip)
const OCCUPATIONS = [
    'Student',
    'Employed - part time',
    'Employed - full time',
    'Self-employed',
    'Academic/Researcher',
    'Unemployed',
    'Retired',
];

// Q6 – Social media time per day
const SOCIAL_TIME = ['Less than 1 hour', '1 - 3 hours', '3 - 6 hours', '6+ hours'];

// Q7 – Social media platforms (checkbox, type=4)
const PLATFORMS = [
    'Instagram', 'Reddit', 'X (formerly twitter)', 'Youtube', 'Telegram/Whatsapp',
];

// Q8 – Meme engagement frequency
const MEME_ENGAGE = [
    'I actively search for memes',
    'I mostly see them in my feed',
    'Both',
    'Rarely engage with memes',
];

// Q9 – Meme categories (checkbox, type=4; last blank=Other, skip)
const MEME_CATEGORIES = [
    'Political', 'Social issues', 'Entertainment', 'Cultural',
    'Events-related', 'Animemes', 'Reactions',
];

// Q10 – Interaction with memes (checkbox, type=4)
const INTERACTIONS = [
    'I  like or react to them',
    'I comment on them',
    'I share them',
    'Sometimes I do all',
    'I only view them without interacting',
];

// Q11 – Verify accuracy
const VERIFY_OPTIONS = [
    'Yes I always verify the accuracy of memes before sharing them',
    'Yes I occasionally verify the accuracy of memes before sharing them',
    'No I do not generally verify the accuracy of memes before sharing them',
    'I do not share memes',
];

// Q12 – Memes influence perception (Likert)
const LIKERT = ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly disagree'];

// Q13 – Meme changed perception
const CHANGED_PERCEPTION = [
    'Yes, it significantly changed my perception',
    'Yes, it somewhat changed my perception',
    'No, it did not change my perception',
    "I don't engage with memes on social or political issues",
];

// Q14 – Meme increased interest in discussing topic
const DISCUSSION_OPTS = [
    'Yes , definitely', 'Yes , somewhat', 'No , not really', 'No , never',
];

// Q21 – Believed false info from meme
const MISINFORMED_OPTS = [
    'Yes it has happened to me',
    'No it has never happened to me ?',
    'Not sure , i don\'t remember',
];

// Q24 – Memes vs news (note: "Strongly Disagree" with capital D in form)
const LIKERT_24 = ['Strongly agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'];

// Q28 – Accountability (optional)
const YES_NO = ['Yes', 'No'];

// Memorable meme descriptions for Q26 (optional)
const MEME_DESCRIPTIONS = [
    'A meme about climate change made me reconsider my carbon footprint habits.',
    'Political memes during elections shifted my view on a candidate\'s policies.',
    'A satirical meme about healthcare opened my eyes to systemic issues.',
    'Memes about mental health reduced the stigma I felt around seeking help.',
    'A meme about wealth inequality changed how I view taxation policy.',
    'A meme comparing historical events to modern politics gave me new perspective.',
    'Humorous memes about gender norms made me reflect on societal expectations.',
    'Memes mocking misinformation actually helped me identify fake news better.',
    'A viral meme about a politician changed how I perceived their credibility.',
    'A meme about environmental destruction motivated me to reduce plastic use.',
];

// Q27 (optional) – How memes shape media narratives
const MEME_NARRATIVES = [
    'Memes simplify complex issues and push a particular narrative virally.',
    'They create emotional reactions that traditional media struggles to replicate.',
    'Memes often set the framing agenda before mainstream media covers a story.',
    'Through repetition and humour, memes normalise certain political viewpoints.',
    'They bypass critical thinking and appeal directly to raw emotions.',
    'Memes can amplify fringe views and bring them into mainstream discourse.',
    'Social media algorithms favour meme virality, shaping which issues trend.',
    'Memes compress nuanced debates into binary narratives that spread rapidly.',
];

// ── Utility helpers ──────────────────────────────────────────
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick 1–N unique items from an array (for checkbox questions). */
function pickMultiple(arr, min = 1, max = 3) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    const count = min + Math.floor(Math.random() * (max - min + 1));
    return shuffled.slice(0, Math.min(count, arr.length));
}

// ── Form data generator ──────────────────────────────────────
function generateFormData() {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

    // Checkbox questions – pick multiple values
    const selectedPlatforms = pickMultiple(PLATFORMS, 1, 4);      // Q7
    const selectedCategories = pickMultiple(MEME_CATEGORIES, 1, 4); // Q9
    const selectedInteractions = pickMultiple(INTERACTIONS, 1, 3);   // Q10

    const data = {
        // Q1  – Name (text)
        'entry.1195228665': name,

        // Q2  – Age group (weighted 18-24 and 25-44 for realism)
        'entry.643035921': pick([...AGE_GROUPS, '18-24', '18-24', '25-44', '25-44']),

        // Q3  – Gender
        'entry.980321187': pick(GENDERS),

        // Q4  – Education (weighted towards tertiary)
        'entry.14037995': pick([...EDUCATIONS, "Bachelor's degree", "Bachelor's degree", "Master's degree"]),

        // Q5  – Occupation (weighted to student/employed)
        'entry.1298383134': pick([...OCCUPATIONS, 'Student', 'Student', 'Employed - full time']),

        // Q6  – Social media time (weighted middle bands)
        'entry.124612769': pick([...SOCIAL_TIME, '1 - 3 hours', '3 - 6 hours']),

        // Q8  – Meme engagement
        'entry.1219664527': pick(MEME_ENGAGE),

        // Q11 – Verify accuracy
        'entry.1791764170': pick(VERIFY_OPTIONS),

        // Q12 – Memes influence perception (Likert)
        'entry.1234655898': pick(LIKERT),

        // Q13 – Meme changed perception
        'entry.1983655635': pick(CHANGED_PERCEPTION),

        // Q14 – Meme increased discussion interest
        'entry.2010043083': pick(DISCUSSION_OPTS),

        // Q15 – Memes → polarization (Likert)
        'entry.1719130868': pick(LIKERT),

        // Q16 – Memes frame differently than media (Likert)
        'entry.1457621': pick(LIKERT),

        // Q17 – Memes reduce seriousness (Likert)
        'entry.1737513919': pick(LIKERT),

        // Q18 – Memes create lasting impressions (Likert)
        'entry.1371786874': pick(LIKERT),

        // Q19 – Memes manipulate info (Likert)
        'entry.69389078': pick(LIKERT),

        // Q20 – Satire distinguishable from facts (Likert)
        'entry.1576029930': pick(LIKERT),

        // Q21 – Believed false meme info
        'entry.1287817140': pick(MISINFORMED_OPTS),

        // Q22 – Memes → online activism / echo chambers (Likert)
        'entry.634092518': pick(LIKERT),

        // Q23 – Memes influence judgement of public figures (Likert)
        'entry.404708019': pick(LIKERT),

        // Q24 – Memes more impactful than news (Likert – capital D variant)
        'entry.715192729': pick(LIKERT_24),

        // Q25 – Memes often very biased (Likert)
        'entry.1407460238': pick(LIKERT),

        // Q26 – (Optional) Describe a meme that changed perception (textarea)
        'entry.1461690793': Math.random() > 0.35 ? pick(MEME_DESCRIPTIONS) : '',

        // Q27 – (Optional) How memes shape media narratives (textarea)
        'entry.1036826585': Math.random() > 0.35 ? pick(MEME_NARRATIVES) : '',

        // Q28 – (Optional) Meme creators accountable
        'entry.306937616': Math.random() > 0.15 ? pick(YES_NO) : '',
    };

    // Checkbox arrays – Google Forms repeats the entry key for multiple values
    data['entry.117915253'] = selectedPlatforms;    // Q7
    data['entry.1135190730'] = selectedCategories;   // Q9
    data['entry.1444296062'] = selectedInteractions; // Q10

    return data;
}

// ── HTTP submission ──────────────────────────────────────────
async function submitForm(index) {
    const formData = generateFormData();
    const postData = querystring.stringify(formData);

    const options = {
        hostname: FORM_SUBMIT_URL,
        path: FORM_PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://docs.google.com/forms/d/e/1FAIpQLSc6PInR772WeY9_vTJmgqWJ01lkkZfiwPgPnaXRl-9LY6Psww/viewform',
        },
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            res.resume(); // consume response body to free socket
            const num = index + 1;
            if (res.statusCode === 200 || res.statusCode === 302) {
                const name = formData['entry.1195228665'];
                console.log(`  ✓ #${String(num).padStart(3, ' ')}: ${name} — OK (${res.statusCode})`);
            } else {
                console.warn(`  ✗ #${String(num).padStart(3, ' ')}: HTTP ${res.statusCode}`);
            }
            resolve();
        });

        req.on('error', (err) => {
            console.error(`  ✗ #${String(index + 1).padStart(3, ' ')}: Error — ${err.message}`);
            resolve();
        });

        req.write(postData);
        req.end();
    });
}

// ── Main runner ──────────────────────────────────────────────
async function run() {
    const TOTAL = 100;
    const BATCH_SIZE = 10;
    const DELAY_MS = 700;

    console.log(`\n🚀  Starting ${TOTAL} form submissions in batches of ${BATCH_SIZE}…`);
    console.log(`    Form: "A short study on the impact of memes"\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const batchEnd = Math.min(i + BATCH_SIZE, TOTAL);
        console.log(`── Batch ${batchNum} (entries ${i + 1}–${batchEnd})`);

        const batch = [];
        for (let j = i; j < batchEnd; j++) {
            batch.push(
                submitForm(j).then(result => result)
            );
        }
        await Promise.all(batch);

        if (batchEnd < TOTAL) {
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    console.log(`\n✅  All ${TOTAL} submission attempts complete.\n`);
}

run();
