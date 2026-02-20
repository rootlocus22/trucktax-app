import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Generates a professional US-style invoice PDF
 * @param {Object} payment - The payment log entry
 * @param {Object} business - The business details
 * @param {Object} user - The user details
 */
export async function generateInvoicePDF(payment, business, user) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]); // Standard Letter size
        const { width, height } = page.getSize();

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const drawText = (text, x, y, size = 10, fontStyle = font, color = rgb(0.1, 0.1, 0.1)) => {
            if (!text) return;
            page.drawText(String(text), { x, y, size, font: fontStyle, color });
        };

        // Header Background
        page.drawRectangle({
            x: 0,
            y: height - 100,
            width: width,
            height: 100,
            color: rgb(0.97, 0.98, 0.99),
        });

        // Company Branding
        drawText('QUICKTRUCKTAX', 40, height - 50, 24, boldFont, rgb(0.09, 0.23, 0.39)); // Navy
        drawText('Official Service Receipt', 40, height - 70, 10, font, rgb(0.4, 0.4, 0.4));

        // Company Details (Top Right)
        let y = height - 40;
        const rightX = 400;
        drawText('Vendax Systems LLC', rightX, y, 10, boldFont);
        y -= 14;
        drawText('28 Geary St STE 650', rightX, y, 9);
        y -= 12;
        drawText('San Francisco, CA 94108', rightX, y, 9);
        y -= 12;
        drawText('support@quicktrucktax.com', rightX, y, 9);

        // Invoice/Receipt Labels
        y = height - 160;
        drawText('RECEIPT ID', 40, y, 8, boldFont, rgb(0.5, 0.5, 0.5));
        drawText('DATE', 260, y, 8, boldFont, rgb(0.5, 0.5, 0.5));
        drawText('PAYMENT METHOD', 420, y, 8, boldFont, rgb(0.5, 0.5, 0.5));
        y -= 15;
        drawText(payment.orderId || payment.id.slice(0, 12).toUpperCase(), 40, y, 10, boldFont);
        const dateStr = payment.timestamp ? new Date(payment.timestamp).toLocaleDateString() : new Date().toLocaleDateString();
        drawText(dateStr, 260, y, 10, boldFont);
        drawText(payment.paymentId ? 'Stripe Secure' : 'Online Payment', 420, y, 10, boldFont);

        // Bill To
        y -= 60;
        drawText('BILL TO', 40, y, 8, boldFont, rgb(0.5, 0.5, 0.5));
        y -= 25;
        drawText(business?.businessName || user?.name || 'Customer', 40, y, 14, boldFont);
        y -= 18;
        if (business?.address) {
            drawText(business.address, 40, y, 9);
            y -= 14;
            const city = business.city || '';
            const state = business.state || '';
            const zip = business.zip || '';
            if (city || state || zip) {
                drawText(`${city}${city && state ? ', ' : ''}${state} ${zip}`.trim(), 40, y, 9);
                y -= 14;
            }
        }
        drawText(user?.email || '', 40, y, 9);

        // Itemized Table
        y -= 60;
        // Table Header
        page.drawRectangle({
            x: 40,
            y: y - 10,
            width: width - 80,
            height: 30,
            color: rgb(0.09, 0.23, 0.39), // Navy
        });
        drawText('DESCRIPTION', 50, y, 10, boldFont, rgb(1, 1, 1));
        drawText('AMOUNT (USD)', 480, y, 10, boldFont, rgb(1, 1, 1));

        // Line Item: Service Fee
        y -= 40;
        const filingLabel = payment.filingType === 'amendment' ? '2290 Amendment' :
            payment.filingType === 'refund' ? 'Form 8849 Refund' :
                (payment.type === 'ucr_filing' || payment.filingType === 'ucr') ? 'UCR Registration Filing' : 'IRS Form 2290 Filing';

        drawText(`${filingLabel} - Professional Service Fee`, 50, y, 11);

        // Handle UCR's payload which uses 'amount' or 'total' if serviceFee is missing
        const itemAmount = payment.serviceFee ?? payment.baseAmount ?? payment.amount ?? payment.total ?? 0;
        drawText(`$${itemAmount.toFixed(2)}`, 480, y, 11, boldFont);

        // Separator
        y -= 30;
        page.drawLine({
            start: { x: 40, y: y },
            end: { x: width - 40, y: y },
            thickness: 1,
            color: rgb(0.9, 0.9, 0.9),
        });

        // Summary Calculations
        y -= 40;
        const summaryX = 330;
        const amountX = 500;
        drawText('Service Subtotal:', summaryX, y, 10);
        const serviceSubtotal = itemAmount;
        drawText(`$${serviceSubtotal.toFixed(2)}`, amountX, y, 10, boldFont);

        if (payment.discountAmount > 0) {
            y -= 20;
            drawText('Discounts:', summaryX, y, 10, font, rgb(0.5, 0, 0));
            drawText(`-$${(payment.discountAmount).toFixed(2)}`, amountX, y, 10, boldFont, rgb(0.5, 0, 0));
        }

        y -= 20;
        drawText('Sales Tax (ST):', summaryX, y, 10);
        drawText(`$${(payment.salesTax || 0).toFixed(2)}`, amountX, y, 10, boldFont);

        // Total
        y -= 40;
        page.drawRectangle({
            x: summaryX - 10,
            y: y - 15,
            width: width - summaryX - 30,
            height: 40,
            color: rgb(0.97, 0.98, 0.99),
        });
        drawText('TOTAL SERVICE COST', summaryX, y, 12, boldFont, rgb(0.09, 0.23, 0.39));
        // The total paid is strictly for the service portion relative to the platform
        const totalServicePaid = serviceSubtotal + (payment.salesTax || 0) - (payment.discountAmount || 0);
        drawText(`$${totalServicePaid.toFixed(2)}`, amountX, y, 14, boldFont, rgb(0.09, 0.23, 0.39));

        // Note about payment
        y -= 60;
        drawText('Note:', 40, y, 8, boldFont);
        y -= 12;
        const noteText = (payment.type === 'ucr_filing' || payment.filingType === 'ucr')
            ? 'This receipt covers the professional service fees for UCR Registration.'
            : 'This receipt covers the professional service fees for Form 2290 filing. Any IRS tax liability is separate.';
        drawText(noteText, 40, y, 8);

        // Footer
        y = 60;
        drawText('QuickTruckTax is a private technology service provider powered by Vendax Systems LLC.', 40, y, 8, font, rgb(0.5, 0.5, 0.5));
        y -= 12;
        drawText('This is a computer-generated receipt. No signature is required.', 40, y, 8, font, rgb(0.5, 0.5, 0.5));

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
}
