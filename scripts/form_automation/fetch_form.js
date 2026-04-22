
const https = require('https');
const fs = require('fs');

const url = 'https://docs.google.com/forms/d/e/1FAIpQLSd_zBqvJBLy7-SVJZPfauEfPyEBMlQLS0QkXuRKK6mDqnQWpQ/viewform?usp=publish-editor';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        fs.writeFileSync('form_source.html', data);
        console.log('Form HTML saved to form_source.html');
    });
}).on('error', (err) => {
    console.error('Error fetching form:', err.message);
});
