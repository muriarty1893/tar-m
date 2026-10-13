# Connecting the forms to Google Sheets

The waitlist, partner and question forms post to the site's own API routes, which forward
each submission to a small Google Apps Script. The script writes it into a
Google Sheet. This takes about 10 minutes, once.

## 1. Create the sheet

1. Go to <https://sheets.google.com> and create a blank spreadsheet, e.g. "Bereket AI Kayıtlar".
2. Rename the first tab to `waitlist` (exactly, lowercase).
3. Add a second tab named `partner`, and a third named `question` (the home page's "Sorunuz mu var?" form).

Leave both tabs empty. The script writes the header row on the first submission.

## 2. Add the script

1. In the sheet: **Extensions → Apps Script**.
2. Delete the sample code and paste the contents of [`apps-script/Code.gs`](apps-script/Code.gs).
3. Click **Project Settings** (gear icon) → **Script properties** → **Add script property**:
   - Property: `SECRET`
   - Value: a long random string (for example, run `openssl rand -hex 24` and paste the output).
   Keep this value; you need it in step 4.
4. Save.

## 3. Deploy it as a web app

1. **Deploy → New deployment** → type **Web app**.
2. Execute as: **Me**. Who has access: **Anyone**.
   "Anyone" is required so the website can reach it. The secret from step 2 stops strangers from writing to your sheet.
3. Click **Deploy**, approve the permissions, and copy the **Web app URL** (ends in `/exec`).

If you change the script later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## 4. Give the URL and secret to the website

Locally, create `.env.local` in the project root:

```
APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
APPS_SCRIPT_SECRET=the-random-string-from-step-2
```

On Vercel: **Project → Settings → Environment Variables**, add the same two
variables for Production (and Preview if you want preview deployments to save
submissions too), then redeploy.

## 5. Test it

Run `npm run dev`, open <http://localhost:3000/#kayit>, submit the form, and check that a row appears in the `waitlist` tab.

## Notes

- Values starting with `=`, `+`, `-` or `@` are stored with a leading `'` so the sheet never runs them as formulas. A phone like `+90…` displays normally.
- Duplicate e-mails are stored as separate rows; remove duplicates in Sheets when needed (**Data → Data cleanup → Remove duplicates**).
- If the script or sheet is unreachable, visitors see an error with your contact e-mail, and what they typed stays in the form.
