# Next Steps — Burnett's Butcher Shop

## Where Things Stand
The order system is built and live. No Jotform, no WordPress — it's a custom build hosted on Cloudflare Pages.

| What | URL |
|------|-----|
| Customer Order Form | burnettsorders.bwabarrie.ca |
| Staff Dashboard | burnettsdashboard.bwabarrie.ca |

Shane's real email is already wired in. When a customer orders, he gets a notification email with a Confirm Order button. He checks the freezer, clicks confirm, and the customer gets the email from him directly. No tech required on Shane's end beyond checking his inbox.

---

## Step 1 — The Meeting (After Monday)

Show Shane the two pieces:

**Order Form (burnettsorders.bwabarrie.ca)**
- This is what customers see
- They pick packages, enter their info, hit submit
- Shane gets an email with the full order and a Confirm Order button
- He clicks it when he's checked stock, his email app opens pre-filled, he hits Send

**Dashboard (burnettsdashboard.bwabarrie.ca) — soft add-on, no pressure**
- Demo logins (password: demo1234):
  - Staff view: staff@burnettsbutcher.com
  - Manager: shane@burnettsbutcher.com
  - Full access: admin@burnettsbutcher.com
- Shows orders in real time, staff can move them through New → Prepping → Ready
- Optional — the email flow works fine without it

---

## Step 2 — Stock Control (Gap to Fix)

Right now there's nothing stopping a customer from ordering a package Shane has run out of. Options:

**Simple fix:** Add a note on the form ("subject to availability") and rely on the confirm step — if Shane's out, he just doesn't click Confirm and follows up with the customer directly.

**Better fix:** Add inventory limits per package in the order form. When a package hits 0, it shows as Sold Out and can't be ordered. Shane resets the count when he restocks. This is a small code change — worth building before or after the meeting depending on how the conversation goes.

---

## Step 3 — Domain Decision

Currently lives on a bwabarrie.ca subdomain. Options:
- **Keep it on burnettsorders.bwabarrie.ca** — free, already working, lowest friction
- **Move to his own domain** (burnetts.ca, burnettsbutcher.ca, etc.) — cleaner for customers, Shane registers the domain (~$15–20/yr), BWA points it to Cloudflare
- **Add a link/button on his existing website** — simplest way to connect it to what he already has; whoever manages his site just adds a button that links to the order form URL

---

## Step 4 — Going Live

Once Shane's happy with it:
- Confirm his email is still correct for order notifications
- Update the from address to bwabarrie.ca (or his domain) once added to Resend
- Replace any remaining placeholder content (menu, photos, logo) — already mostly done
- Add the link to his existing website or social pages

---

## Future Add-Ons (If He Wants Them)

| Add-On | Cost |
|--------|------|
| Stock control per package | Included in next build |
| Online payment (Stripe — pay now instead of pay at pickup) | ~$300 one-time + $25/mo |
| Staff dashboard (if he wants it) | Already built — just needs a decision |
| Full Burnett's website | ~$300–500 depending on scope |
| His own domain | ~$15–20/yr (he registers it) |
| Monthly maintenance | $75/mo |
