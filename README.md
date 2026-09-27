# KILLERS VIP website

Static HTML, CSS and JavaScript website. No package installation, build step, or application database is required.

## Pages

- index.html: home and service overview.
- plans.html and plan-*.html: plans and free community links.
- contact.html, forex-contact.html, all-contact.html: public VIP payment instructions and group links.
- advance-course-contact.html: course payment instructions.
- buy-usdt-contact.html and sell-usdt-contact.html: USDT contact and payment instructions.
- support-contact.html: WhatsApp and Telegram support.
- privacy-policy.html and terms-conditions.html: existing legal pages.

## Folders

- css/: styles used by the pages.
- js/: navigation, animations, payment/contact button handlers and existing browser interaction restrictions.
- assets/: logo and course artwork.
- images/: favicon, touch icon and social preview.

## Preview and deployment

Serve this directory using any static HTTP server, then open index.html. Deploy the contents of this directory to the static host. Keep CNAME, robots.txt and sitemap.xml at the site root. External fonts and icons require internet access.

## Cleanup

Removed the retired code-based VIP flow, unused account forms, disconnected authentication/dashboard scripts, unused styles and assets, and the unlinked old USDT page. Removed account navigation links and the hidden code-entry modal. Preserved the home button animation in css/animate.index.css. Fixed duplicate script loading on the support page, repaired undefined copy-button handlers on four payment pages, and updated the sitemap.

The existing legal text describes historical account/database features; the site owner should review that text against current operations before publishing.

## Verification

Checked all 15 HTML pages: 207 local references resolve, 37 inline/external script executions pass a lightweight DOM-stub check, and all 51 inline click handlers reference available functions. No unreferenced CSS, JS or image files remain. Browser smoke checks covered Home -> Plans -> Crypto payment and Support; no browser console errors were recorded during the checked flow. External messaging and payment transactions were not performed.

## Payment and contact update

All five bank-transfer pages show only SAMPATH BANK, account 102552925136, Edirisinghe, Matale, with a reminder to put the payer name in the payment remark. All five Binance payment displays and their copy buttons use 817185426. Receipt and support buttons use the supplied WhatsApp message link and @Killers_VIP_1 on Telegram. The free WhatsApp group uses the new invitation; VIP group destinations are unchanged. Home and Plans each use assets/vip-card.jpg behind the Crypto and Forex cards; the course artwork is unchanged.

Validation checked all bank display/copy values, Binance display/copy values, six receipt handlers, the free group URL, and absence of the old payment/support values. The home artwork and updated Crypto payment page were also inspected in the browser.
