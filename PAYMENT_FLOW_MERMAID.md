# Payment Flow Diagrams - Mermaid

## 1. Complete Payment Flow

```mermaid
flowchart TD
    Start([Customer Creates Filing]) --> Review[Review Filing Details]
    Review --> Submit[Click Submit Filing]
    Submit --> CreateFiling[Create Filing Document<br/>Status: submitted]
    CreateFiling --> Redirect[Redirect to Checkout Page]
    
    Redirect --> Checkout{Checkout Page}
    
    Checkout --> ServiceFee[💳 Service Fee Payment<br/>Amount: $39.99<br/>Method: Stripe Card]
    Checkout --> IRSPayment[🏛️ IRS Tax Payment<br/>Amount: $550.00<br/>Method: Customer Selects]
    
    ServiceFee --> StripeForm[Stripe Payment Form]
    StripeForm --> StripeProcess[Process via Stripe API]
    StripeProcess --> StripeSuccess{Payment<br/>Success?}
    
    StripeSuccess -->|Yes| ServiceFeePaid[Service Fee Paid<br/>Status: paid]
    StripeSuccess -->|No| StripeError[Show Error<br/>Allow Retry]
    StripeError --> StripeForm
    
    IRSPayment --> SelectMethod{Select IRS<br/>Payment Method}
    
    SelectMethod -->|Option 1| DirectDebit[Direct Bank Debit<br/>⭐ Recommended]
    SelectMethod -->|Option 2| CreditCard[Credit Card<br/>Redirect to IRS]
    SelectMethod -->|Option 3| Check[Check/Money Order<br/>Voucher Provided]
    SelectMethod -->|Option 4| EFTPS[EFTPS<br/>Manual Payment]
    
    DirectDebit --> CollectBank[Collect Bank Details<br/>Routing + Account Number]
    CreditCard --> CreditCardNote[Show Note:<br/>Will receive payment link]
    Check --> CheckNote[Show Note:<br/>Will receive voucher]
    EFTPS --> EFTPSNote[Show Note:<br/>Pay via EFTPS.gov]
    
    CollectBank --> EncryptBank[Encrypt Bank Details]
    CreditCardNote --> StoreMethod
    CheckNote --> StoreMethod
    EFTPSNote --> StoreMethod
    EncryptBank --> StoreMethod[Store Payment Method<br/>in Filing Document]
    
    ServiceFeePaid --> CheckBoth{Both Payments<br/>Ready?}
    StoreMethod --> CheckBoth
    
    CheckBoth -->|Service Fee Paid<br/>IRS Method Selected| UpdateFiling[Update Filing<br/>Status: paid]
    CheckBoth -->|Service Fee Failed| ShowError[Show Error<br/>Block Submission]
    ShowError --> StripeForm
    
    UpdateFiling --> GenerateInvoice[Generate Service Fee<br/>Invoice PDF]
    GenerateInvoice --> SendInvoiceEmail[Send Invoice Email<br/>to Customer]
    
    UpdateFiling --> AgentQueue[Add to Agent Queue<br/>Status: paid]
    
    AgentQueue --> AgentView[Agent Views Filing<br/>in Portal]
    AgentView --> VerifyPayment{Verify<br/>Payments}
    
    VerifyPayment -->|Service Fee Paid ✅<br/>IRS Method Selected ✅| ProcessManual[Agent Processes<br/>Manually in<br/>Quick Truck Tax]
    VerifyPayment -->|Service Fee Not Paid| BlockProcessing[Block Processing<br/>Show Alert]
    
    ProcessManual --> ManualFiling[Agent Files in<br/>Quick Truck Tax<br/>Website]
    
    DirectDebit --> ManualFiling
    CreditCard --> ManualFiling
    Check --> ManualFiling
    EFTPS --> ManualFiling
    
    ManualFiling --> GetSchedule1[Agent Receives<br/>Stamped Schedule 1<br/>from Quick Truck Tax]
    GetSchedule1 --> UploadSchedule1[Agent Uploads<br/>Schedule 1 PDF]
    UploadSchedule1 --> UpdateStatus[Update Filing<br/>Status: completed]
    
    UpdateStatus --> NotifyCustomer[Email Customer:<br/>Schedule 1 Available]
    
    CreditCard --> CreditCardFlow[Customer Receives<br/>Payment Link Email]
    CreditCardFlow --> CustomerPaysIRS[Customer Pays<br/>via IRS Site]
    
    Check --> CheckFlow[Customer Receives<br/>Voucher Email]
    CheckFlow --> CustomerMailsCheck[Customer Mails<br/>Check to IRS]
    
    DirectDebit --> IRSDebits[IRS Debits Customer<br/>Bank Account<br/>24-48 hours]
    
    EFTPS --> CustomerPaysEFTPS[Customer Pays<br/>via EFTPS.gov]
    
    style ServiceFee fill:#e1f5ff
    style IRSPayment fill:#fff4e1
    style DirectDebit fill:#e8f5e9
    style ServiceFeePaid fill:#c8e6c9
    style UpdateFiling fill:#c8e6c9
    style ProcessManual fill:#fff9c4
    style UpdateStatus fill:#c8e6c9
```

---

## 2. Payment Methods Comparison

```mermaid
graph LR
    subgraph ServiceFee["💳 Service Fee: $39.99"]
        SF[QuickTruckTax<br/>Collects via Stripe]
        SF --> SFPaid[Customer Pays<br/>at Checkout]
    end
    
    subgraph IRSTax["🏛️ IRS Tax: $550.00"]
        subgraph Method1["Option 1: Direct Debit ⭐"]
            DD[Customer Enters<br/>Bank Details]
            DD --> API[Send to<br/>Quick Truck Tax]
            API --> IRS1[IRS Debits<br/>Account Directly]
            IRS1 --> Auto[Automatic<br/>24-48 hours]
        end
        
        subgraph Method2["Option 2: Credit Card"]
            CC[Customer Selects<br/>Credit Card]
            CC --> Link[Receive Payment<br/>Link Email]
            Link --> IRS2[Pay via<br/>IRS/ACI Site]
            IRS2 --> Manual1[Customer Pays<br/>Separately]
        end
        
        subgraph Method3["Option 3: Check"]
            CH[Customer Selects<br/>Check]
            CH --> Voucher[Receive Form<br/>2290-V Voucher]
            Voucher --> Mail[Print & Mail<br/>Check to IRS]
            Mail --> Manual2[Customer Mails<br/>Separately]
        end
        
        subgraph Method4["Option 4: EFTPS"]
            EF[Customer Selects<br/>EFTPS]
            EF --> File[File Return]
            File --> EFTPS[Pay via<br/>EFTPS.gov]
            EFTPS --> Manual3[Customer Pays<br/>Manually]
        end
    end
    
    style ServiceFee fill:#e1f5ff
    style Method1 fill:#e8f5e9
    style Method2 fill:#fff4e1
    style Method3 fill:#fff4e1
    style Method4 fill:#fff4e1
```

---

## 3. Agent Manual Processing Flow

```mermaid
flowchart TD
    AgentLogin([Agent Logs In]) --> AgentPortal[Agent Portal<br/>/agent]
    AgentPortal --> ViewQueue[View Filing Queue<br/>Status: paid]
    
    ViewQueue --> SelectFiling[Select Filing]
    SelectFiling --> ViewDetails[View Filing Details]
    
    ViewDetails --> CheckServiceFee{Service Fee<br/>Paid?}
    CheckServiceFee -->|No| Alert1[Show Alert:<br/>Payment Required]
    CheckServiceFee -->|Yes| CheckIRSMethod{IRS Payment<br/>Method Selected?}
    
    CheckIRSMethod -->|No| Alert2[Show Alert:<br/>Select Payment Method]
    CheckIRSMethod -->|Yes| ShowPaymentInfo[Display Payment Info]
    
    ShowPaymentInfo --> ShowBankDetails{Direct<br/>Debit?}
    ShowBankDetails -->|Yes| DisplayBank[Display Bank Details<br/>Last 4: ****1234]
    ShowPaymentInfo --> ShowCreditCard{Credit<br/>Card?}
    ShowCreditCard -->|Yes| DisplayNote[Display Note:<br/>Customer pays separately]
    ShowPaymentInfo --> ShowCheck{Check?}
    ShowCheck -->|Yes| DisplayVoucher[Display Voucher<br/>Email Status]
    ShowPaymentInfo --> ShowEFTPS{EFTPS?}
    ShowEFTPS -->|Yes| DisplayEFTPS[Display Note:<br/>Customer pays via EFTPS]
    
    DisplayBank --> CopyData[Copy Customer Data<br/>Business + Vehicles]
    DisplayNote --> CopyData
    DisplayVoucher --> CopyData
    DisplayEFTPS --> CopyData
    
    CopyData --> OpenQuickTruckTax[Open Quick Truck Tax<br/>Website]
    OpenQuickTruckTax --> LoginQuickTruckTax[Login to<br/>Quick Truck Tax]
    LoginQuickTruckTax --> EnterData[Enter Customer Data<br/>Manually]
    
    EnterData --> SelectPaymentMethod{Select Payment<br/>Method in<br/>Quick Truck Tax}
    
    SelectPaymentMethod -->|Direct Debit| EnterBankQT[Enter Bank Details<br/>in Quick Truck Tax]
    SelectPaymentMethod -->|Credit Card| SelectCCQT[Select Credit Card<br/>Get Payment Link]
    SelectPaymentMethod -->|Check| SelectCheckQT[Select Check<br/>Get Voucher]
    SelectPaymentMethod -->|EFTPS| SelectEFTPSQT[Select EFTPS]
    
    EnterBankQT --> SubmitQT[Submit Filing<br/>to Quick Truck Tax]
    SelectCCQT --> SubmitQT
    SelectCheckQT --> SubmitQT
    SelectEFTPSQT --> SubmitQT
    
    SubmitQT --> WaitConfirmation[Wait for<br/>Quick Truck Tax<br/>Confirmation]
    WaitConfirmation --> ReceiveSchedule1[Receive Stamped<br/>Schedule 1 PDF]
    
    ReceiveSchedule1 --> UploadSchedule1[Upload Schedule 1<br/>to QuickTruckTax App]
    UploadSchedule1 --> UpdateStatus[Update Filing Status<br/>completed]
    
    UpdateStatus --> TrackPayment{Track IRS<br/>Payment Status}
    
    TrackPayment -->|Direct Debit| WaitIRS[Wait for IRS<br/>Debit Confirmation<br/>24-48 hours]
    TrackPayment -->|Credit Card| CheckCustomer[Check if Customer<br/>Completed Payment]
    TrackPayment -->|Check| CheckMailed[Check if Customer<br/>Mailed Check]
    TrackPayment -->|EFTPS| CheckEFTPS[Check if Customer<br/>Paid via EFTPS]
    
    WaitIRS --> Complete[Mark Complete]
    CheckCustomer --> Complete
    CheckMailed --> Complete
    CheckEFTPS --> Complete
    
    Complete --> NotifyCustomer[Email Customer:<br/>Schedule 1 Available]
    
    style CheckServiceFee fill:#ffebee
    style CheckIRSMethod fill:#ffebee
    style CopyData fill:#fff9c4
    style SubmitQT fill:#e8f5e9
    style UpdateStatus fill:#c8e6c9
```

---

## 4. Payment Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Submitted: Customer Submits Filing
    
    Submitted --> ServiceFeePending: Redirect to Checkout
    
    ServiceFeePending --> ServiceFeeFailed: Stripe Payment Fails
    ServiceFeeFailed --> ServiceFeePending: Customer Retries
    
    ServiceFeePending --> ServiceFeePaid: Stripe Payment Success
    
    ServiceFeePaid --> Paid: IRS Method Selected
    
    Paid --> Processing: Agent Starts Processing
    
    Processing --> ActionRequired: IRS Rejection
    ActionRequired --> Processing: Customer Responds
    
    Processing --> Completed: Schedule 1 Uploaded
    
    Completed --> [*]
    
    note right of ServiceFeePending
        Service Fee: $39.99
        Payment Method: Stripe Card
    end note
    
    note right of Paid
        Service Fee: Paid ✅
        IRS Method: Selected ✅
        Ready for Agent Processing
    end note
    
    note right of Processing
        Agent files manually
        in Quick Truck Tax
    end note
```

---

## 5. Data Flow Diagram

```mermaid
flowchart LR
    subgraph Customer["Customer"]
        C1[Create Filing] --> C2[Review Details]
        C2 --> C3[Submit Filing]
        C3 --> C4[Checkout Page]
        C4 --> C5[Pay Service Fee<br/>$39.99]
        C5 --> C6[Select IRS Method]
        C6 --> C7[Complete Checkout]
    end
    
    subgraph QuickTruckTax["QuickTruckTax App"]
        Q1[Filing Document<br/>Status: submitted] --> Q2[Service Fee Payment<br/>via Stripe]
        Q2 --> Q3[Store IRS Payment Method]
        Q3 --> Q4[Update Status: paid]
        Q4 --> Q5[Generate Invoice]
        Q5 --> Q6[Send to Agent Queue]
    end
    
    subgraph Stripe["Stripe"]
        S1[Payment Intent] --> S2[Process Card]
        S2 --> S3[Charge Customer]
        S3 --> S4[Webhook: Payment Success]
    end
    
    subgraph Agent["Agent Portal"]
        A1[View Queue] --> A2[Select Filing]
        A2 --> A3[Verify Payments]
        A3 --> A4[Copy Customer Data]
        A4 --> A5[Process in Quick Truck Tax]
        A5 --> A6[Upload Schedule 1]
        A6 --> A7[Update Status: completed]
    end
    
    subgraph QuickTruckTaxWebsite["Quick Truck Tax Website"]
        QT1[Agent Logs In] --> QT2[Enter Customer Data]
        QT2 --> QT3[Select Payment Method]
        QT3 --> QT4[Submit Filing]
        QT4 --> QT5[Receive Schedule 1]
    end
    
    subgraph IRS["IRS"]
        I1[Receive Filing] --> I2{Payment Method}
        I2 -->|Direct Debit| I3[Debit Bank Account]
        I2 -->|Credit Card| I4[Send Payment Link]
        I2 -->|Check| I5[Generate Voucher]
        I2 -->|EFTPS| I6[Wait for EFTPS Payment]
        I3 --> I7[Process Filing]
        I4 --> I7
        I5 --> I7
        I6 --> I7
        I7 --> I8[Issue Schedule 1]
    end
    
    C7 --> Q1
    Q2 --> S1
    S4 --> Q4
    Q6 --> A1
    A4 --> QT1
    QT5 --> A6
    QT3 --> I1
    
    style Customer fill:#e1f5ff
    style QuickTruckTax fill:#fff4e1
    style Stripe fill:#e8f5e9
    style Agent fill:#fff9c4
    style QuickTruckTaxWebsite fill:#f3e5f5
    style IRS fill:#ffebee
```

---

## 6. IRS Payment Method Details

```mermaid
flowchart TD
    Start([Customer Selects IRS Payment Method]) --> Method{Which Method?}
    
    Method -->|Direct Debit| DD[Direct Bank Debit]
    Method -->|Credit Card| CC[Credit Card]
    Method -->|Check| CH[Check/Money Order]
    Method -->|EFTPS| EF[EFTPS]
    
    DD --> DD1[Collect Bank Details<br/>Routing + Account Number]
    DD1 --> DD2[Encrypt & Store]
    DD2 --> DD3[Agent Copies to<br/>Quick Truck Tax]
    DD3 --> DD4[Quick Truck Tax<br/>Sends to IRS]
    DD4 --> DD5[IRS Debits Account<br/>24-48 hours]
    DD5 --> DD6[Automatic Payment ✅]
    
    CC --> CC1[Show Note:<br/>Will receive payment link]
    CC1 --> CC2[Agent Selects<br/>Credit Card in<br/>Quick Truck Tax]
    CC2 --> CC3[Quick Truck Tax<br/>Generates Payment Link]
    CC3 --> CC4[Email Link to Customer]
    CC4 --> CC5[Customer Pays<br/>via IRS/ACI Site]
    CC5 --> CC6[Manual Payment ⚠️]
    
    CH --> CH1[Show Note:<br/>Will receive voucher]
    CH1 --> CH2[Agent Selects<br/>Check in Quick Truck Tax]
    CH2 --> CH3[Quick Truck Tax<br/>Generates Form 2290-V]
    CH3 --> CH4[Email Voucher to Customer]
    CH4 --> CH5[Customer Prints & Mails]
    CH5 --> CH6[Manual Payment ⚠️]
    
    EF --> EF1[Show Note:<br/>Pay via EFTPS.gov]
    EF1 --> EF2[Agent Selects<br/>EFTPS in Quick Truck Tax]
    EF2 --> EF3[File Return]
    EF3 --> EF4[Customer Pays<br/>via EFTPS.gov]
    EF4 --> EF5[Manual Payment ⚠️]
    
    style DD fill:#e8f5e9
    style DD6 fill:#c8e6c9
    style CC fill:#fff4e1
    style CC6 fill:#ffecb3
    style CH fill:#fff4e1
    style CH6 fill:#ffecb3
    style EF fill:#fff4e1
    style EF5 fill:#ffecb3
```

---

## 7. Database Schema

```mermaid
erDiagram
    FILINGS ||--o{ PAYMENTS : "has"
    FILINGS }o--|| BUSINESSES : "belongs to"
    FILINGS ||--o{ VEHICLES : "contains"
    FILINGS }o--|| SERVICE_FEE_PAYMENT : "has"
    FILINGS }o--|| IRS_PAYMENT_METHOD : "has"
    
    FILINGS {
        string id PK
        string userId FK
        string businessId FK
        array vehicleIds FK
        string taxYear
        string firstUsedMonth
        string filingType
        string status
        timestamp createdAt
        timestamp updatedAt
        object serviceFeePayment
        object irsPaymentMethod
    }
    
    PAYMENTS {
        string id PK
        string userId FK
        string filingId FK
        number amount
        number serviceFee
        number salesTax
        string status
        string stripePaymentIntentId
        string stripeChargeId
        timestamp paidAt
        string invoiceUrl
        string receiptUrl
    }
    
    SERVICE_FEE_PAYMENT {
        number amount
        string status
        string stripePaymentIntentId
        timestamp paidAt
    }
    
    IRS_PAYMENT_METHOD {
        string method
        string status
        object bankDetails
        string paymentLink
        string voucherUrl
        object irsConfirmation
    }
    
    BUSINESSES {
        string id PK
        string userId FK
        string businessName
        string ein
        string address
        string phone
    }
    
    VEHICLES {
        string id PK
        string userId FK
        string vin
        string grossWeightCategory
        boolean isSuspended
    }
```

---

## 8. Checkout Page Flow

```mermaid
flowchart TD
    Start([Customer Arrives at Checkout]) --> DisplaySummary[Display Filing Summary]
    
    DisplaySummary --> ShowServiceFee[💳 Service Fee: $39.99<br/>Paid via Stripe]
    DisplaySummary --> ShowIRSTax[🏛️ IRS Tax: $550.00<br/>Select Payment Method]
    
    ShowServiceFee --> StripeForm[Stripe Card Input Form]
    StripeForm --> ProcessStripe[Process Stripe Payment]
    ProcessStripe --> StripeResult{Payment<br/>Result?}
    
    StripeResult -->|Success| ServiceFeePaid[Service Fee Paid ✅]
    StripeResult -->|Failed| StripeError[Show Error<br/>Allow Retry]
    StripeError --> StripeForm
    
    ShowIRSTax --> SelectIRSMethod{Select IRS<br/>Payment Method}
    
    SelectIRSMethod -->|Direct Debit| DirectDebitForm[Direct Debit Form<br/>Routing Number<br/>Account Number<br/>Account Type<br/>Account Holder Name]
    SelectIRSMethod -->|Credit Card| CreditCardInfo[Credit Card Info<br/>Note: Will receive<br/>payment link]
    SelectIRSMethod -->|Check| CheckInfo[Check Info<br/>Note: Will receive<br/>voucher]
    SelectIRSMethod -->|EFTPS| EFTPSInfo[EFTPS Info<br/>Note: Pay via<br/>EFTPS.gov]
    
    DirectDebitForm --> ValidateBank{Validate Bank<br/>Details?}
    ValidateBank -->|Valid| StoreBankDetails[Store Bank Details<br/>Encrypted]
    ValidateBank -->|Invalid| ShowBankError[Show Validation Error]
    ShowBankError --> DirectDebitForm
    
    CreditCardInfo --> StoreMethod
    CheckInfo --> StoreMethod
    EFTPSInfo --> StoreMethod
    StoreBankDetails --> StoreMethod[Store Payment Method<br/>in Filing]
    
    ServiceFeePaid --> CheckReady{Both Ready?}
    StoreMethod --> CheckReady
    
    CheckReady -->|Yes| EnableSubmit[Enable Submit Button]
    CheckReady -->|No| DisableSubmit[Disable Submit Button]
    
    EnableSubmit --> SubmitFiling[Submit Filing]
    SubmitFiling --> UpdateFiling[Update Filing Status: paid]
    UpdateFiling --> Redirect[Redirect to Filing Detail Page]
    
    style ShowServiceFee fill:#e1f5ff
    style ShowIRSTax fill:#fff4e1
    style DirectDebitForm fill:#e8f5e9
    style ServiceFeePaid fill:#c8e6c9
    style SubmitFiling fill:#4caf50,color:#fff
```

---

## 9. Payment Processing Sequence

```mermaid
sequenceDiagram
    participant C as Customer
    participant CP as Checkout Page
    participant S as Stripe
    participant QTT as QuickTruckTax App
    participant A as Agent
    participant QTTW as Quick Truck Tax Website
    participant IRS as IRS
    
    C->>CP: Submit Filing
    CP->>CP: Display Service Fee & IRS Tax
    
    C->>CP: Enter Card Details
    CP->>S: Create Payment Intent
    S->>CP: Return Client Secret
    CP->>S: Confirm Payment
    S->>CP: Payment Success
    CP->>QTT: Update Filing (Service Fee Paid)
    
    C->>CP: Select IRS Payment Method
    C->>CP: Enter Bank Details (if Direct Debit)
    CP->>QTT: Store IRS Payment Method
    
    CP->>QTT: Update Filing Status: paid
    QTT->>QTT: Add to Agent Queue
    
    A->>QTT: View Filing Queue
    A->>QTT: Select Filing
    QTT->>A: Display Filing Details
    
    A->>A: Copy Customer Data
    A->>QTTW: Login to Quick Truck Tax
    A->>QTTW: Enter Customer Data
    A->>QTTW: Select Payment Method
    A->>QTTW: Submit Filing
    
    QTTW->>IRS: Submit Filing
    IRS->>QTTW: Return Schedule 1
    
    A->>QTTW: Download Schedule 1
    A->>QTT: Upload Schedule 1
    QTT->>QTT: Update Status: completed
    QTT->>C: Email: Schedule 1 Available
    
    alt Direct Debit
        IRS->>IRS: Debit Bank Account (24-48h)
    else Credit Card
        IRS->>C: Send Payment Link
        C->>IRS: Complete Payment
    else Check
        IRS->>C: Generate Voucher
        C->>IRS: Mail Check
    else EFTPS
        C->>IRS: Pay via EFTPS.gov
    end
```

---

## How to View These Diagrams

### In Cursor/VS Code:
1. Open this file (`PAYMENT_FLOW_MERMAID.md`)
2. Use the Markdown preview (`Cmd+Shift+V` / `Ctrl+Shift+V`)
3. Diagrams will render automatically!

### In GitHub:
- Just push the file to GitHub
- GitHub automatically renders Mermaid diagrams

### Online:
- Copy any diagram code
- Paste at: https://mermaid.live/
- View and edit interactively

---

**Last Updated:** January 2025  
**Status:** Mermaid Diagrams - Easy to View  
**No Installation Required!**
