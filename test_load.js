const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function testLoad() {
    try {
        const pdfBytes = fs.readFileSync('/Users/pawankoul/Documents/Company_Repository/trucktax-app/public/templates/mcs150-template.pdf');
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        console.log('Successfully loaded template');
        console.log('Page count:', pdfDoc.getPageCount());
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testLoad();
