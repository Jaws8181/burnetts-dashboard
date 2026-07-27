# Burnett's Butcher Shop — Pitch Reference
**Client:** Shane Burnett (friend)
**Status:** Built, demo live, email drafted but not sent

---

## One-Line Pitch
"I built Burnett's its own online order system and staff dashboard — no Jotform, no third-party fees, you own the whole thing."

---

## Live URLs
| What | URL | Notes |
|------|-----|-------|
| Order Form | burnettsorders.bwabarrie.ca | Customer-facing |
| Staff Dashboard | burnettsdashboard.bwabarrie.ca | Internal use |

**Demo logins (all password: demo1234)**
| Role | Email |
|------|-------|
| Owner / Full Access | admin@burnettsbutcher.com |
| Manager | shane@burnettsbutcher.com |
| Staff (counter view) | staff@burnettsbutcher.com |

Start with Staff login — that's what the counter person sees. Then try Manager/Admin for the full picture.

---

## How It Works (The Flow)

1. Customer goes to order form, picks packages + quantities
2. Running total updates live as they select
3. They fill in name, email, phone, preferred pickup time
4. Optional: subscribe checkbox for promotions/updates
5. Order hits the dashboard instantly — shows as "New"
6. Staff moves it through: New → Prepping → Ready for Pickup
7. Each role sees what's appropriate (staff = counter view only, manager/admin = full control)

---

## Tech Stack
- **Frontend:** Custom HTML/CSS/JS — no CMS, no WordPress
- **Backend/Database:** PocketBase on Railway (Railway URL: pocketbase-production-81bc.up.railway.app)
- **Hosting:** Cloudflare Pages (bwabarrie.ca subdomain)
- **Version control:** GitHub (github.com/Jaws8181)
- **Deploy:** Push via GitHub Desktop → Cloudflare auto-deploys

---

## What's Placeholder / Not Live Yet
- Products/packages are examples — need Shane's actual menu and pricing
- Background photo (bg.jpg) is a placeholder — can use a real Burnett's photo
- Logo is placeholder — need his actual logo file
- Email notifications not wired to a real address yet (PocketBase configured for demo)
- Subscriber list collection exists in PocketBase — CASL compliant opt-in checkbox is live

---

## Likely Questions Shane Will Ask

**"Does this replace my current website?"**
No — this is just the order form and dashboard. It can live as a standalone page, or we can add it into a full Burnett's website later.

**"What happens when someone orders — do I get an email?"**
Yes. PocketBase sends an email notification when a new order comes in. We just need to point it at your real email address.

**"What does it cost me?"**
Nothing right now — this is the BWA launch build, done free as a working demo. If you want to keep it running and maintained, we'd talk about a $75/month plan. You own the code either way.

**"What if I want to change the menu or prices?"**
I handle that — just message me. Takes 5 minutes.

**"Is it secure?"**
Yes. HTTPS everywhere, data sits in your own PocketBase instance on Railway. Nothing goes through a third party except the hosting infrastructure.

**"What about commissions?"**
Zero. No per-order fees. Unlike DoorDash or SkipTheDishes (which take 15–30%), this is yours. Payment processor fees (Stripe) only apply if you add online payment — we haven't done that yet.

**"Can customers pay online?"**
Not yet — current version is pickup/pay-in-store. Online payment is an add-on ($400 one-time + $25/mo) if he ever wants it.

---

## What's Currently Free vs Future Costs

| Item | Cost |
|------|------|
| Order form + dashboard (current build) | Free (BWA promo) |
| Hosting (bwabarrie.ca subdomain, for now) | Free |
| Monthly maintenance + updates | $75/mo (if he wants BWA to manage it) |
| Move to his own domain | Included |
| Online payment (Stripe) | +$400 build / +$25/mo |
| Full Burnett's website build | ~$250–500 depending on scope |
| Social scheduling add-on | +$40/mo |

---

## Next Steps When Shane Says Yes

- [x] Add customer confirmation email flow — Shane gets a "Confirm Order" button in his notification email, clicks it when inventory is confirmed, then customer gets the confirmation. Prevents auto-confirming orders Shane can't fill.
- [x] Add customer email to submit.js (triggered by Shane's confirm, not automatic)
- [x] NOTIFY_EMAIL set to Shane's real email, Cloudflare deploy live
- [x] Real menu, logo, background photo, and assets already in order form
- [ ] Domain — Shane may want to host it himself. If BWA hosts: add domain to Resend, update from address accordingly

## What You Need From Shane to Finish
- Domain preference (burnetts.ca? burnettsbutchershop.ca?) — or happy on bwabarrie.ca subdomain
- Confirmation he wants to go live
