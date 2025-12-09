const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../spline_viewer.html');
const outputPath = path.join(__dirname, '../public/scene.splinecode');

try {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const match = html.match(/runtime\.start\(\[(.*?)\]\)/);

    if (match && match[1]) {
        const dataStr = match[1];
        const data = dataStr.split(',').map(Number);
        const buffer = Buffer.from(data);
        fs.writeFileSync(outputPath, buffer);
        console.log(`Successfully wrote ${data.length} bytes to ${outputPath}`);
    } else {
        console.error('Could not find runtime.start data in HTML');
        process.exit(1);
    }
} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
