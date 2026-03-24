# Global MFT — Website

**Domain:** globalmft.cobranext.com  
**Owner:** Global MFT · A CobraNext Company  
**Purpose:** Institutional reference site for business provider verification (Meta, payment processors, telecom carriers)

---

## File Structure

```
globalmft/
├── index.html              ← Homepage
├── _redirects              ← Cloudflare Pages URL redirects
├── _headers                ← Cloudflare security headers
├── assets/
│   ├── favicon.png         ← Site favicon / logo mark (the "pelota")
│   └── logo.jpg            ← Full Global MFT horizontal logo
├── css/
│   └── global.css          ← Shared stylesheet (all pages use this)
├── js/
│   ├── nav.js              ← Shared header + footer injector
│   └── main.js             ← Shared JS (scroll, animations, forms)
└── pages/
    ├── services.html       ← IT Consulting Services
    ├── analytics.html      ← Business Analytics Consulting
    ├── products.html       ← ISV Products (Zelle, IXM Portal)
    ├── about.html          ← About Global MFT / CobraNext
    ├── contact.html        ← Contact form + info
    └── terms.html          ← Terms & Conditions / Privacy Policy
```

---

## Deploy to Cloudflare Pages

### Option A — Direct Upload (no Git required)
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create a project
2. Choose **"Direct Upload"**
3. Upload the entire `globalmft/` folder
4. Set **Project name**: `globalmft`
5. After first deploy, go to **Custom Domains** → Add `globalmft.cobranext.com`
6. In your DNS (cobranext.com zone), add a CNAME: `globalmft` → `globalmft.pages.dev`

### Option B — Git (GitHub/GitLab)
1. Push this folder to a repo
2. Cloudflare Pages → New project → Connect to Git
3. **Build command:** _(leave blank — static site)_
4. **Build output directory:** `/` (root)
5. Add custom domain as above

---

## Updating Content

- **All navigation, header, footer** — edit `js/nav.js` (the `GMFTNav.inject` function)
- **Colors, fonts, shared styles** — edit `css/global.css` (CSS variables at top)
- **Individual pages** — edit the `.html` file in `pages/` or `index.html`
- **Favicon/logo** — replace files in `assets/` (keep same filenames)

---

## Primary Domain Migration (globalmft.us)

When `globalmft.us` is ready:
1. Add `globalmft.us` as a custom domain in Cloudflare Pages
2. Update the announce bar in `js/nav.js` (remove "pending" language)
3. Add a redirect in `_redirects`: `https://globalmft.cobranext.com/* https://globalmft.us/:splat 301`

