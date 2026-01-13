const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function inspect() {
    const pdfBytes = fs.readFileSync('public/assets/FMCSA Form MCS-150.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log(`Has XFA: ${form.hasXFA()}`);
    console.log(`Found ${fields.length} fields:`);
    fields.forEach(field => {
        const type = field.constructor.name;
        const name = field.getName();
        console.log(`- ${name} (${type})`);
    });
}

inspect().catch(console.error);
