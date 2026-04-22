const https = require('https');
const querystring = require('querystring');

// ============================================================
// GenZ Survival Kit - College Edition Google Form Auto-Filler
// Form URL: https://docs.google.com/forms/d/e/1FAIpQLSd_zBqvJBLy7-SVJZPfauEfPyEBMlQK50QkXuRKK6mDqnQWpQ/viewform
// ============================================================

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd_zBqvJBLy7-SVJZPfauEfPyEBMlQK50QkXuRKK6mDqnQWpQ/formResponse';

// ---------- Indian Student Names ----------
const FIRST_NAMES = [
    "Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Reyansh", "Krishna", "Ishaan", "Shaurya", "Rohan",
    "Aadhya", "Diya", "Saanvi", "Ananya", "Kiara", "Pari", "Riya", "Myra", "Aarohi", "Fatima",
    "Vikram", "Rahul", "Priya", "Sneha", "Anjali", "Neha", "Pooja", "Kavita", "Suresh", "Ramesh",
    "Deepak", "Amit", "Sanjay", "Karthik", "Manish", "Nikhil", "Abhishek", "Pranav", "Rishi", "Tanvi",
    "Divya", "Shruti", "Meera", "Nisha", "Vishal", "Gaurav", "Akash", "Kunal", "Mohit", "Swati"
];

const LAST_NAMES = [
    "Sharma", "Patel", "Reddy", "Singh", "Kumar", "Das", "Gupta", "Rao", "Nair", "Mehta",
    "Jain", "Iyer", "Chopra", "Desai", "Joshi", "Bhat", "Verma", "Saxena", "Yadav", "Khan",
    "Mishra", "Pandey", "Chatterjee", "Acharya", "Banerjee", "Dutta", "Ghosh", "Agarwal",
    "Tiwari", "Chauhan", "Rajput", "Dubey", "Shukla", "Srivastava", "Kapoor"
];

// ---------- Question Options (from form entry IDs) ----------

// Q2: entry.1868368262
const STUDENT_TYPES = [
    "The Last-Night Warrior",
    "The Attendance Strategist",
    "The Front Bench Intellectual",
    "The Silent Observer",
    "The \"Group Project Survivor\""
];

// Q3: entry.1638358145
const MOTIVATIONS = [
    "Grades",
    "Money",
    "Passion",
    "Parental Pressure",
    "Vibes"
];

// Q4: entry.1708352285
const PHONE_HOURS = [
    "<3 Hours",
    "3-5 Hours",
    "5-8 Hours",
    "8+ Hours"
];

// Q5: entry.1874860011
const DISTRACTIONS = [
    "Instagram",
    "YouTube",
    "Gaming",
    "Texting",
    "Overthinking"
];

// Q6: entry.358492503
const STRESS_OUTLETS = [
    "Friends",
    "Partner",
    "Family",
    "No One",
    "Gym"
];

// Q7: entry.873451128
const COLLEGE_FEARS = [
    "Backlogs",
    "Placements",
    "Public Speaking",
    "Being Average",
    "Running out of money"
];

// Q8: entry.241261086 => Linear scale 1-10
// Q9: entry.2024779498
const DREAM_LIVES = [
    "Corporate Job",
    "Startup",
    "Higher Studies",
    "Content Creater",
    "Still Figuring Out"
];

// ---------- Helpers ----------
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFormData() {
    const name = `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;

    return {
        // Q1: Name (short answer text)
        'entry.411441446': name,

        // Q2: What type of student are you? (multiple choice)
        'entry.1868368262': getRandomItem(STUDENT_TYPES),

        // Q3: What motivates you more? (multiple choice)
        'entry.1638358145': getRandomItem(MOTIVATIONS),

        // Q4: How many hours do you spend on your phone daily? (multiple choice)
        'entry.1708352285': getRandomItem(PHONE_HOURS),

        // Q5: What distracts you more while studying? (multiple choice)
        'entry.1874860011': getRandomItem(DISTRACTIONS),

        // Q6: Who do you talk to when stressed? (multiple choice)
        'entry.358492503': getRandomItem(STRESS_OUTLETS),

        // Q7: What is your biggest college fear? (multiple choice)
        'entry.873451128': getRandomItem(COLLEGE_FEARS),

        // Q8: Rate your current stress level (linear scale 1-10)
        'entry.241261086': String(getRandomInt(1, 10)),

        // Q9: What is your dream life after graduation? (multiple choice)
        'entry.2024779498': getRandomItem(DREAM_LIVES),
    };
}

// ---------- Submission ----------
async function submitForm(i) {
    const formData = generateFormData();
    const postData = querystring.stringify(formData);

    const options = {
        hostname: 'docs.google.com',
        path: '/forms/d/e/1FAIpQLSd_zBqvJBLy7-SVJZPfauEfPyEBMlQK50QkXuRKK6mDqnQWpQ/formResponse',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    };

    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            res.resume(); // drain the response
            if (res.statusCode === 200 || res.statusCode === 302) {
                console.log(`[${String(i + 1).padStart(3, '0')}] ✔ Success — ${formData['entry.411441446']}`);
            } else {
                console.error(`[${String(i + 1).padStart(3, '0')}] ✘ Failed — HTTP ${res.statusCode}`);
            }
            resolve();
        });

        req.on('error', (e) => {
            console.error(`[${String(i + 1).padStart(3, '0')}] ✘ Error — ${e.message}`);
            resolve();
        });

        req.write(postData);
        req.end();
    });
}

// ---------- Run ----------
async function run() {
    const TOTAL = 100;
    const BATCH_SIZE = 10;
    console.log(`\n🚀 Starting ${TOTAL} form submissions (GenZ Survival Kit - College Edition)\n`);

    let successCount = 0;

    for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
        const batch = [];
        for (let j = 0; j < BATCH_SIZE && (i + j) < TOTAL; j++) {
            batch.push(submitForm(i + j).then(() => successCount++));
        }
        await Promise.all(batch);
        console.log(`--- Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(TOTAL / BATCH_SIZE)} complete ---\n`);

        // Small polite delay between batches
        if (i + BATCH_SIZE < TOTAL) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    console.log(`\n✅ Done! ${successCount}/${TOTAL} submissions completed.`);
}

run();
