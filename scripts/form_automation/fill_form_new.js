const https = require('https');
const querystring = require('querystring');

const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeSMlCuTo8kSqpJG8jmHRWyduc5jkwvbiDlFfhUjir_PB7F-w/formResponse';

// Indian Context Data
const FIRST_NAMES = [
    "Aditya", "Sai", "Arjun", "Reyansh", "Ishaan", "Shaurya", "Rohan", "Vikram", "Rahul",
    "Priya", "Sneha", "Anjali", "Neha", "Pooja", "Kavita", "Suresh", "Ramesh", "Deepak",
    "Amit", "Sanjay", "Karthik", "Manish", "Nikhil", "Abhishek", "Pranav", "Tanmay", "Vedant"
];

const LAST_NAMES = [
    "Sharma", "Patel", "Reddy", "Singh", "Kumar", "Das", "Gupta", "Rao", "Nair", "Mehta",
    "Jain", "Iyer", "Chopra", "Desai", "Joshi", "Bhat", "Verma", "Saxena", "Yadav", "Kulkarni"
];

const GENDERS = ["Male", "Female", "Prefer not to say"];
const YEARS = ["FY(1st year)", "SY(2nd Year)", "TY(3rd year)", "FY(4th year)"];
const SEMESTERS = ["1", "2"];
const DEPARTMENTS = ["CSE", "CSE(AIML)", "CSE(AI)", "IT", "CSE(IOT)", "MECHANICAL", "CIVIL", "ENTC", "AIDS", "CYBERSECURITY"];

// Options for other questions
const WALLET_OPTS = ["Yes, always.", "Sometimes (just ID and one card).", "No, just my phone."];
const CASH_OPTS = ["₹0 (Literally nothing)", "Enough for emergency (<400)", "A decent amount (500+)"];
const UPI_APPS = ["Gpay", "Phonepe", "Paytm", "Amazon Pay", "Fampay", "BHIM UPI", "Samsung wallet"];
const YEARS_UPI = ["1", "2", "3", "4", "5", "6", "Don't know just started using It"];
const SMALLEST_AMT_OPTS = ["1", "2", "3"]; // 1=Even 1, 2=Min 10, 3=Big bills
const SCANNER_FREQ = ["1", "2", "3", "4", "5"]; // 1=least, 5=only UPI
const DIGIGOLD_OPTS = ["yes", "no"];
const CASH_ONLY_REACTION = ["\"Wait, let me check if I have cash.\"", "ask/conner the person for UPI ID", "ask someone else to pay for you and you UPI back to them"];
const KIRANA_LOOK = ["The QR Code sticker on the wall/jar", "The items I want to buy", "My wallet to see if I have coins (US BHAI US 😭)"];
const CHANGE_REACTION = ["\"Happily! I prefer paying online anyway.\"", "\"Annoyed. I was trying to get rid of this cash note!\"", "I tell him to keep the change (HA theek hai bhai tu zyada Ameer hai 😭)."];
const TOTAL_SPENT_THOUGHT = ["DEKHNA PADTA HAI HISAB DENA PADTA HAI (😭)", "DEKHTA HU EXPENSES KA TRACK RAKHNE KE LIYE (🤌)", "DEKHNA PADTA HAI KYUKI LIMITED PAISE MILTE HAI (😐)"];
const MONTHLY_SPEND = ["5000+", "10000+", "Don't keep track of your payments"];
const SAVE_DIGITALLY = ["Yes, I invest/save via apps.(SHABASH KEEP IT UP 👍)", "I try, but I withdraw it often (KYA BRO 😐 )", "No, I have 0 savings (😭)"];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePRN() {
    // 10 digits starting from 12511
    // So 12511 + 5 random digits
    const suffix = Math.floor(10000 + Math.random() * 90000); // 5 digit random number
    return `12511${suffix}`;
}

function generateFormData() {
    const name = `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
    const prn = generatePRN();

    return {
        'entry.366340186': prn, // PRN
        'entry.268976903': name, // Full Name
        'entry.57872441': getRandomItem(GENDERS), // Gender
        'entry.964424578': getRandomInt(18, 23).toString(), // Age
        'entry.1839267816': getRandomItem(YEARS), // Year
        'entry.259637958': getRandomItem(SEMESTERS), // Semester (assuming random 1 or 2 implies odd/even, just picking random)
        'entry.1035529555': getRandomItem(DEPARTMENTS), // Department

        // "UPI vs. Wallet" section questions
        'entry.1706998284': getRandomItem(WALLET_OPTS), // Carry physical wallet?
        'entry.1132809554': getRandomItem(CASH_OPTS), // How much cash right now?
        'entry.1765261714': getRandomItem(UPI_APPS), // Which UPI do you use? (Checkbox usually allows multiple, here picking one main one is safer for simple string submission, or multiple keys. Form usually takes multiple entries with same key for checkboxes. We'll send one commonly used one for simplicity or verify single-select behavior. Viewing HTML suggestions input type="checkbox" logic usually needs multiple params. Wait, 'entry.1765261714' in HTML analysis was under a checkbox question? Let's assume picking one is fine for now, or send multiple. Let's send one popular one.)
        'entry.1495164181': getRandomItem(YEARS_UPI), // Years using UPI

        // Grid Ratings (1-5)
        'entry.868624901': getRandomInt(3, 5).toString(), // Gpay
        'entry.517588054': getRandomInt(3, 5).toString(), // Fampay
        'entry.809850254': getRandomInt(3, 5).toString(), // PhonePe
        'entry.1093008131': getRandomInt(3, 5).toString(), // Amazon Pay
        'entry.1428959719': getRandomInt(3, 5).toString(), // Paytm

        'entry.246578094': getRandomItem(SMALLEST_AMT_OPTS), // Smallest amount
        'entry.847566794': getRandomItem(SCANNER_FREQ), // QR Scanner freq
        'entry.1838202115': getRandomItem(DIGIGOLD_OPTS), // Invest in Digigold
        'entry.2110142991': getRandomItem(CASH_ONLY_REACTION), // Cash Only reaction
        'entry.601964875': getRandomItem(KIRANA_LOOK), // Kiarna look
        'entry.739240159': getRandomItem(CHANGE_REACTION), // Change reaction
        'entry.421456749': getRandomItem(TOTAL_SPENT_THOUGHT), // Total spent thought
        'entry.928821771': getRandomItem(MONTHLY_SPEND), // Monthly spend
        'entry.1369267267': getRandomItem(SAVE_DIGITALLY), // Save digitally

        'entry.1369267267': getRandomItem(SAVE_DIGITALLY), // Save digitally

        'pageHistory': '0,1,2', // Page traversal path (Section 1 -> 2 -> 3)
        'fvv': '1',
        'partialResponse': '[null,null,"6497674823881148808"]',
        'fbzx': '6497674823881148808',

        // Sentinels for validation
        'entry.57872441_sentinel': '',
        'entry.1839267816_sentinel': '',
        'entry.259637958_sentinel': '',
        'entry.1035529555_sentinel': '',
        'entry.1765261714_sentinel': '',
        'entry.1495164181_sentinel': '',
        'entry.868624901_sentinel': '',
        'entry.517588054_sentinel': '',
        'entry.809850254_sentinel': '',
        'entry.1093008131_sentinel': '',
        'entry.1428959719_sentinel': '',
        'entry.246578094_sentinel': '',
        'entry.847566794_sentinel': '',
        'entry.1838202115_sentinel': '',
        'entry.2110142991_sentinel': '',
        'entry.601964875_sentinel': '',
        'entry.739240159_sentinel': '',
        'entry.421456749_sentinel': '',
        'entry.928821771_sentinel': '',
        'entry.1369267267_sentinel': ''
    };
}

async function submitForm(i) {
    const formData = generateFormData();
    const postData = querystring.stringify(formData);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(FORM_URL, options, (res) => {
            if (res.statusCode === 200 || res.statusCode === 302) {
                console.log(`Entry #${i + 1}: Success - ID: ${formData['entry.366340186']} Name: ${formData['entry.268976903']}`);
                resolve();
            } else {
                console.error(`Entry #${i + 1}: Failed with status ${res.statusCode}`);
                resolve(); // Resolve to valid continuing loop
            }
        });

        req.on('error', (e) => {
            console.error(`Entry #${i + 1}: Error - ${e.message}`);
            resolve();
        });

        req.write(postData);
        req.end();
    });
}

async function run() {
    console.log("Starting 80 submissions for UPI Survey...");
    for (let i = 0; i < 80; i++) {
        await submitForm(i);
        // Small delay
        await new Promise(r => setTimeout(r, 500));
    }
    console.log("Completed!");
}

run();
