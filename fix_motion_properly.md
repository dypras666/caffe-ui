# Files to Fix

Due to sed errors, need to manually fix these files:
1. MemberOrdersPage.jsx - line 48-49
2. MemberBookingsPage.jsx - line 37
3. MemberLoginPage.jsx - line 18

## Approach
Replace `<div` (without closing `>`) with proper `<div>`

These files have broken opening tags where the `>` was removed by mistake.
