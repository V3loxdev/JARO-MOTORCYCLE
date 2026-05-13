# TODO - Split Public vs Dashboard

## Step 1
Create folders/files structure:
- public/index.html
- public/style.css
- public/app.js
- dashboard/index.html
- dashboard/style.css
- dashboard/app.js

## Step 2
Implement public page:
- Homepage + Contact only
- Inventory grid rendering via public/app.js
- Nav links to Admin (/dashboard/)

## Step 3
Implement dashboard page:
- Admin-only modules
- Dashboard view switching handled in dashboard/app.js

## Step 4
Update root index.html:
- Redirect to ./public/index.html (and/or provide fallback)

## Step 5
Sanity checks:
- Open public/index.html and verify inventory renders
- Open dashboard/index.html and verify admin renders

## Step 6
Final smoke test (optional):
- Verify localStorage keys remain compatible
- Quick check for console errors

