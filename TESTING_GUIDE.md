# Complete Filing Lifecycle Testing Guide

This guide will walk you through testing the entire filing process from customer submission to agent completion.

## Prerequisites

1. **Two Browser Windows/Tabs** (or use Incognito mode for one):
   - **Window 1**: Customer account (regular user)
   - **Window 2**: Agent account (user with `role: "agent"` in Firestore)

2. **Firebase Console Access**: To verify data in Firestore

---

## Step 1: Set Up Agent Account

### In Firebase Console:
1. Go to **Firestore Database** → **users** collection
2. Find your agent user document (or create one)
3. Set the `role` field to `"agent"`
4. Save the document

### Verify Agent Access:
- Log in with the agent account
- You should see "Agent Portal" in the user menu dropdown
- Click it to access `/agent`

---

## Step 2: Customer Creates a Filing

### In Customer Window (Window 1):

#### Option A: Upload Schedule 1 PDF (Recommended for Quick Test)
1. Log in as a customer
2. Go to **Dashboard**
3. Click **"Upload Schedule 1 PDF"**
4. Select a PDF file (or create a test PDF)
5. Fill in:
   - **Tax Year**: 2025-2026
   - **First Used Month**: July
6. Click **"Extract Data"**
7. Wait for AI extraction to complete
8. Review extracted data
9. Submit the filing

**Expected Result:**
- Filing is created with status `"submitted"`
- You're redirected to the filing detail page
- Status badge shows "Submitted"

#### Option B: Manual Entry
1. Go to **Dashboard** → **"Manual Entry"**
2. **Step 1**: Select or create a business
3. **Step 2**: Select or create vehicles (at least 1)
4. **Step 3**: Upload documents (optional)
5. **Step 4**: Review and submit

**Expected Result:**
- Filing is created with status `"submitted"`
- Redirected to filing detail page

---

## Step 3: Agent Views Filing in Queue

### In Agent Window (Window 2):

1. Go to **Agent Portal** (`/agent`)
2. You should see the filing in the queue table

**Expected Result:**
- Customer name and email visible
- Business name and EIN visible
- Number of vehicles shown
- Status: "Submitted" (blue badge)
- Submission date visible
- "Work on this →" link available

**If you see "Loading..." or "N/A":**
- Check browser console for errors
- Verify Firestore rules are deployed
- Check that user/business documents exist in Firestore

---

## Step 4: Agent Opens Work Station

### In Agent Window:

1. Click **"Work on this →"** on the filing
2. You're taken to `/agent/filings/[filingId]`

**Expected Result:**
- **Left Panel**: Customer Data
  - Business Information (all fields visible)
  - Vehicles list (with VIN, weight, suspended status)
  - Filing Details (Tax Year, First Used Month)
- **Right Panel**: Actions
  - Status dropdown (currently "Submitted")
  - Notes textarea
  - Schedule 1 upload section

---

## Step 5: Agent Updates Status to "Processing"

### In Agent Window:

1. In the **"Update Status"** dropdown, select **"Processing"**
2. Status should update immediately

**Expected Result:**
- Status badge changes to "Processing" (amber/yellow)
- Filing disappears from agent queue (if queue only shows submitted/action_required)
- Customer can see status change in their dashboard

**Verify in Customer Window:**
- Refresh the customer dashboard
- The filing should show "Processing" status

---

## Step 6: Agent Adds Notes (Optional)

### In Agent Window:

1. In **"Notes to Customer"** textarea, type:
   ```
   Processing your filing. We'll have it ready soon.
   ```
2. Click **"Save Notes"**

**Expected Result:**
- Button shows "Saving..." then returns to "Save Notes"
- Notes are saved (check Firestore if needed)

**Verify in Customer Window:**
- Go to the filing detail page
- If status is "action_required", notes should be visible

---

## Step 7: Agent Updates Status to "Action Required" (Optional Test)

### In Agent Window:

1. Change status to **"Action Required"**
2. Add notes: `"Please verify your EIN number"`
3. Save notes

**Expected Result:**
- Status changes to "Action Required" (orange badge)
- Filing appears in agent queue again
- Customer sees action required alert on their filing detail page

**Verify in Customer Window:**
- Filing detail page shows orange "Action Required" alert
- Notes are displayed in the alert box

---

## Step 8: Agent Uploads Schedule 1 and Completes Filing

### In Agent Window:

1. Change status back to **"Processing"** (if needed)
2. In **"Upload Stamped Schedule 1"** section:
   - Click **"Choose file"**
   - Select a PDF file (test Schedule 1)
3. Click **"Upload Schedule 1 & Mark Complete"**

**Expected Result:**
- Button shows "Uploading..."
- Status automatically changes to "Completed" (green badge)
- Filing disappears from agent queue
- Success message appears

**Verify in Customer Window:**
- Go to filing detail page
- Should see green "Your Schedule 1 is Ready!" alert
- **"Download Schedule 1 PDF"** button is visible
- Clicking it downloads the PDF

---

## Step 9: Verify Complete Lifecycle

### Check All Status Transitions:

1. **Submitted** → Customer creates filing
2. **Processing** → Agent starts working
3. **Action Required** → Agent needs info (optional)
4. **Completed** → Schedule 1 uploaded

### Verify Data Persistence:

1. **In Firestore Console:**
   - Go to `filings` collection
   - Find your test filing
   - Verify:
     - `status` field changes
     - `agentNotes` field (if added)
     - `finalSchedule1Url` field (after upload)
     - `updatedAt` timestamp updates

2. **In Customer Dashboard:**
   - All status changes should be visible
   - Completed filings show download button

3. **In Agent Queue:**
   - Only `submitted`, `processing`, and `action_required` filings appear
   - Completed filings don't appear (as expected)

---

## Troubleshooting

### Issue: Filing not appearing in agent queue
**Solutions:**
- Check filing status is `"submitted"`, `"processing"`, or `"action_required"`
- Verify Firestore rules are deployed
- Check browser console for errors
- Refresh the agent queue page

### Issue: "Loading..." in agent queue
**Solutions:**
- Verify Firestore rules allow agents to read users/businesses
- Check that user and business documents exist in Firestore
- Look for permission errors in browser console

### Issue: Can't upload Schedule 1
**Solutions:**
- Verify file is PDF format
- Check Firebase Storage rules allow agent uploads
- Check browser console for errors
- Verify agent has proper permissions

### Issue: Status not updating
**Solutions:**
- Check browser console for errors
- Verify Firestore rules allow write access
- Check network tab for failed requests
- Try refreshing the page

---

## Quick Test Checklist

- [ ] Customer can create filing (Schedule 1 upload or manual)
- [ ] Filing appears in agent queue
- [ ] Agent can see customer and business info
- [ ] Agent can see vehicles list
- [ ] Agent can update status to "Processing"
- [ ] Customer sees status change
- [ ] Agent can add notes
- [ ] Agent can change status to "Action Required"
- [ ] Customer sees action required alert
- [ ] Agent can upload Schedule 1
- [ ] Status automatically changes to "Completed"
- [ ] Customer can download Schedule 1
- [ ] Completed filing doesn't appear in agent queue

---

## Tips for Testing

1. **Use Browser DevTools**: Keep console open to see any errors
2. **Check Network Tab**: Monitor API calls and Firestore requests
3. **Use Firestore Console**: Verify data changes in real-time
4. **Test Edge Cases**:
   - Filing with no business (Schedule 1 upload)
   - Filing with multiple vehicles
   - Filing with suspended vehicles
   - Very long business names/EINs

---

## Next Steps After Testing

Once you've verified the complete flow:
1. Test with real Schedule 1 PDFs
2. Test with multiple concurrent filings
3. Test error scenarios (network failures, invalid files)
4. Test with different user roles
5. Verify all UI states and transitions

