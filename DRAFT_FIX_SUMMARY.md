# Draft Filing Fix Summary

## Issues Found:
1. Drafts not saving - conditions too strict or errors silently failing
2. Firestore permission errors - rules need to be deployed
3. Drafts not appearing on dashboard - subscription might be failing

## Fixes Applied:

### 1. Firestore Rules (`firestore.rules`)
- ✅ Added rules for `draftFilings` collection
- ⚠️ **NEEDS DEPLOYMENT**: Rules file is updated but must be deployed to Firebase

### 2. Draft Saving Logic
- ✅ Added explicit draft saving when moving to payment page (both workflows)
- ✅ Added draft saving when pricing is calculated
- ✅ Improved error logging

### 3. Dashboard Subscription
- ✅ Added error handling in subscription
- ✅ Added fallback for missing index
- ✅ Added console logging for debugging

## Next Steps:
1. **DEPLOY FIRESTORE RULES** - This is critical!
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Check Browser Console** - Look for:
   - "Saving draft filing..." messages
   - "Draft saved with ID: ..." messages
   - Any Firestore permission errors

3. **Test Flow**:
   - Start a filing (manual or upload)
   - Go to payment page
   - Check browser console for draft save messages
   - Abandon and check dashboard

## Debug Checklist:
- [ ] Firestore rules deployed?
- [ ] Browser console shows draft save messages?
- [ ] No permission errors in console?
- [ ] Draft appears in Firestore console?

