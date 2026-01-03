export const errorCodes = [
    {
        code: "R0000-058-01",
        title: "IRS Error Code R0000-058-01",
        shortDesc: "Business Name or EIN mismatch with IRS records.",
        cause: "The EIN and Name Control combination provided does not match IRS Master File.",
        fix: "Ensure your legally registered business name matches exactly what is on your SS-4 letter. If you recently obtained your EIN, wait 2 weeks before filing."
    },
    {
        code: "R0000-900-01",
        title: "IRS Error Code R0000-900-01",
        shortDesc: "Return already filed for this tax period.",
        cause: "The IRS has already accepted a Form 2290 for this EIN for the same tax period.",
        fix: "If you need to add a vehicle, file an Amendment (Form 2290) instead of a new return. If this is a mistake, contact the IRS Help Desk."
    },
    {
        code: "R0000-901-01",
        title: "IRS Error Code R0000-901-01",
        shortDesc: "VIN duplication error.",
        cause: "A return with this VIN has already been filed for the tax period.",
        fix: "Check if you or your service provider already filed for this truck. If you bought a used truck, the previous owner may have filed. Verify and potentially file a VIN Correction if you entered it wrong."
    },
    {
        code: "R0000-500-01",
        title: "IRS Error Code R0000-500-01",
        shortDesc: "Routing Transit Number error.",
        cause: "The bank Routing Transit Number (RTN) for direct debit is invalid.",
        fix: "Double-check your 9-digit routing number from a check or bank statement. Do not use a deposit slip routing number."
    },
    {
        code: "R0000-503-02",
        title: "IRS Error Code R0000-503-02",
        shortDesc: "Bank Account Number missing or invalid.",
        cause: "Bank Account Number for payment is formatted incorrectly.",
        fix: "Enter the account number exactly as it appears on your bank statement, without hyphens or spaces."
    }
];

export function getErrorCode(code) {
    return errorCodes.find(e => e.code === code);
}
