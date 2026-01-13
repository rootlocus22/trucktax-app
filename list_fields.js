const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function listFields() {
    try {
        const pdfBytes = fs.readFileSync('/Users/pawankoul/Documents/Company_Repository/trucktax-app/public/templates/mcs150-template.pdf');
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        fields.forEach(field => {
            const type = field.constructor.name;
            const name = field.getName();
            console.log(`${type}: ${name}`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listFields();
