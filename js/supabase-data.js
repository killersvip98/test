// supabase-data.js
// Shared logic for fetching and rendering dynamic content from Supabase
// Uses window.supabaseClient for guaranteed global access

document.addEventListener('DOMContentLoaded', async () => {
  // Only fetch and render dynamic content for frontend pages (skip on admin page)
  if (!window.location.pathname.includes('admin.html')) {
    await fetchAndRenderPlans();
    setupRealtimeSubscription();
  }
});

async function fetchAndRenderPlans() {
  try {
    if (!window.supabaseClient) {
      console.warn('[supabase-data] Supabase client is not initialized. Retrying in 500ms...');
      setTimeout(fetchAndRenderPlans, 500);
      return;
    }

    const { data: plans, error } = await window.supabaseClient
      .from('plans')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    window.sitePlans = plans; // Cache globally
    console.log('[supabase-data] Plans loaded:', plans.length, 'plans');

    try { renderDynamicPrices(plans); } catch (e) { console.error('[supabase-data] renderDynamicPrices error:', e); }
    try { syncFooterPrices(plans); }    catch (e) { console.error('[supabase-data] syncFooterPrices error:', e); }
    try { syncInnerPagePrice(plans); }  catch (e) { console.error('[supabase-data] syncInnerPagePrice error:', e); }
    try { renderContactPageDetails(); } catch (e) { console.error('[supabase-data] renderContactPageDetails error:', e); }
    try { renderFreePageLinks(); }      catch (e) { console.error('[supabase-data] renderFreePageLinks error:', e); }

  } catch (err) {
    console.error('[supabase-data] Error fetching plans:', err.message);
  }
}

// ─────────────────────────────────────────────────────────
// 1. Update any element with [data-plan-slug] that contains .price-num
//    e.g. the .amt spans on plans.html
// ─────────────────────────────────────────────────────────
function renderDynamicPrices(plans) {
  document.querySelectorAll('[data-plan-slug]').forEach(el => {
    const slug = el.getAttribute('data-plan-slug');
    // Skip containers that are payment grids or free-link containers
    if (el.id === 'dynamic-payment-grid' || el.id === 'dynamic-free-links') return;

    const plan = plans.find(p => p.plan_slug === slug);
    if (!plan || plan.price === undefined) return;

    const priceNumEl = el.querySelector('.price-num');
    if (priceNumEl) {
      priceNumEl.textContent = plan.price;
    } else {
      el.textContent = plan.price;
    }
  });
}

// ─────────────────────────────────────────────────────────
// 2. Update footer links that have [data-footer-plan-slug]
//    Works on ALL pages that have the footer
// ─────────────────────────────────────────────────────────
function syncFooterPrices(plans) {
  document.querySelectorAll('[data-footer-plan-slug]').forEach(link => {
    const slug = link.getAttribute('data-footer-plan-slug');
    const plan = plans.find(p => p.plan_slug === slug);
    if (!plan) return;

    const nameMap = { 'crypto': 'Crypto VIP', 'forex': 'Forex VIP', 'all': 'All-in-One' };
    const name = nameMap[slug] || plan.plan_name;
    link.textContent = `${name} — ${plan.price} USDT`;
  });
}

// ─────────────────────────────────────────────────────────
// 3. Update .price-num on inner plan detail pages
//    Detects page by path: plan-crypto, plan-forex, plan-all
// ─────────────────────────────────────────────────────────
function syncInnerPagePrice(plans) {
  const path = window.location.pathname.toLowerCase();

  let slug = null;
  if (path.includes('plan-crypto'))   slug = 'crypto';
  else if (path.includes('plan-forex')) slug = 'forex';
  else if (path.includes('plan-all'))   slug = 'all';

  if (!slug) return;

  const plan = plans.find(p => p.plan_slug === slug);
  if (!plan) return;

  const priceNum = document.querySelector('.price-num');
  if (priceNum) {
    priceNum.textContent = plan.price;
    console.log(`[supabase-data] Inner page price updated to ${plan.price} USDT for slug "${slug}"`);
  }
}

// ─────────────────────────────────────────────────────────
// 4. Render bank/binance/group-links cards into #dynamic-payment-grid
//    Works on contact.html, forex-contact.html, all-contact.html,
//    usdt-contact.html, buy-usdt-contact.html, sell-usdt-contact.html
// ─────────────────────────────────────────────────────────
function renderContactPageDetails() {
  const grid = document.getElementById('dynamic-payment-grid');
  if (!grid || !window.sitePlans) return;

  const slug = grid.getAttribute('data-plan-slug');
  const plan = window.sitePlans.find(p => p.plan_slug === slug);

  if (!plan) {
    grid.innerHTML = '<div style="text-align:center;width:100%;color:var(--text-muted);grid-column:1/-1;padding:40px;">No payment details found.</div>';
    return;
  }

  let html = '';
  const isUSDT = plan.plan_slug === 'usdt-config';

  // Bank cards
  if (Array.isArray(plan.bank_details) && plan.bank_details.length > 0) {
    plan.bank_details.forEach(bank => {
      html += `
        <div class="pay-card">
          <div class="card-head-row">
            <div class="pay-icon"><i class="fas fa-university"></i></div>
            <h2>Bank Transfer</h2>
          </div>
          <div class="detail-row">
            <span class="lbl">Account Name</span>
            <span class="val">${bank.holder || ''}</span>
            <button class="copy-btn" onclick="copyText('${(bank.holder || '').replace(/'/g,"\\'")}')"><i class="fas fa-copy"></i></button>
          </div>
          <div class="detail-row">
            <span class="lbl">Account Number</span>
            <span class="val">${bank.acc_number || ''}</span>
            <button class="copy-btn" onclick="copyText('${(bank.acc_number || '').replace(/'/g,"\\'")}')"><i class="fas fa-copy"></i></button>
          </div>
          <div class="detail-row">
            <span class="lbl">Bank</span>
            <span class="val">${bank.bank_name || ''}</span>
            <button class="copy-btn" onclick="copyText('${(bank.bank_name || '').replace(/'/g,"\\'")}')"><i class="fas fa-copy"></i></button>
          </div>
          <div class="detail-row">
            <span class="lbl">Branch</span>
            <span class="val">${bank.branch || ''}</span>
            <button class="copy-btn" onclick="copyText('${(bank.branch || '').replace(/'/g,"\\'")}')"><i class="fas fa-copy"></i></button>
          </div>
        </div>`;
    });
  }

  // Binance cards
  if (Array.isArray(plan.binance_ids) && plan.binance_ids.length > 0) {
    plan.binance_ids.forEach(bin => {
      html += `
        <div class="pay-card">
          <div class="card-head-row">
            <div class="pay-icon binance-icon"><i class="fab fa-bitcoin"></i></div>
            <h2>Binance Pay</h2>
          </div>
          <div class="detail-row">
            <span class="lbl">${bin.label || 'Binance ID'}</span>
            <span class="val">${bin.id || ''}</span>
            <button class="copy-btn" onclick="copyText('${(String(bin.id || '')).replace(/'/g,"\\'")}')"><i class="fas fa-copy"></i></button>
          </div>
          ${!isUSDT ? `<p class="pay-note">Send exactly <strong>${plan.price} USDT</strong> via Binance Pay.</p>` : ''}
        </div>`;
    });
  }

  // Group links / USDT transaction links
  if (Array.isArray(plan.group_links) && plan.group_links.length > 0) {
    html += `
      <div class="pay-card">
        <div class="card-head-row">
          <div class="pay-icon group-icon"><i class="${isUSDT ? 'fas fa-exchange-alt' : 'fab fa-telegram-plane'}"></i></div>
          <h2>${isUSDT ? 'USDT Transactions' : 'VIP Group Access'}</h2>
        </div>
        <p class="pay-note">${isUSDT ? 'Select whether you want to Buy or Sell USDT below.' : 'After payment, request VIP access below.'}</p>
        <div class="action-btns">
          ${plan.group_links.map(link => {
            let icon = 'fab fa-telegram-plane';
            let btnClass = 'tg-btn';
            let prefix = 'REQUEST — ';
            if (link.type === 'whatsapp') { icon = 'fab fa-whatsapp'; btnClass = 'wa-btn'; }
            else if (link.type === 'buy')  { icon = 'fas fa-shopping-cart'; btnClass = 'tg-btn'; prefix = ''; }
            else if (link.type === 'sell') { icon = 'fas fa-money-bill-wave'; btnClass = 'wa-btn'; prefix = ''; }
            return `<button class="act-btn ${btnClass}" onclick="window.location.href='${link.link}'">
              <i class="${icon}"></i> ${prefix}${link.name}
            </button>`;
          }).join('')}
        </div>
      </div>`;
  }

  // Receipt notice block (only for non-USDT VIP plans)
  if (!isUSDT) {
    html += `
      <div class="notice-card">
        <i class="fas fa-info-circle notice-icon"></i>
        <div>
          <h3>Important Notice</h3>
          <p>ගෙවීම සිදු කර ගෙවීම් රිසිට්පත WhatsApp හෝ Telegram හරහා අපට එවන්න.<br><br>All payments and join requests are checked and approved by admins.</p>
          <div class="action-btns">
            ${plan.receipt_whatsapp ? `<button class="act-btn wa-btn" onclick="window.location.href='${plan.receipt_whatsapp}'"><i class="fab fa-whatsapp"></i> SEND RECEIPT — WhatsApp</button>` : ''}
            ${plan.receipt_telegram ? `<button class="act-btn tg-btn" onclick="window.location.href='${plan.receipt_telegram}'"><i class="fab fa-telegram-plane"></i> SEND RECEIPT — Telegram</button>` : ''}
          </div>
        </div>
      </div>`;
  }

  grid.innerHTML = html;
  console.log(`[supabase-data] Payment grid rendered for slug "${slug}"`);
}

// ─────────────────────────────────────────────────────────
// 5. Render join buttons on the free plan page
// ─────────────────────────────────────────────────────────
function renderFreePageLinks() {
  const container = document.getElementById('dynamic-free-links');
  if (!container || !window.sitePlans) return;

  const slug = container.getAttribute('data-plan-slug');
  const plan = window.sitePlans.find(p => p.plan_slug === slug);
  if (!plan || !Array.isArray(plan.group_links)) return;

  let html = '';
  plan.group_links.forEach(link => {
    const isWa = link.type === 'whatsapp';
    html += `<button class="join-btn btn-${isWa ? 'whatsapp' : 'telegram'}" onclick="window.open('${link.link}','_blank')">
      <i class="fab fa-${isWa ? 'whatsapp' : 'telegram-plane'}"></i> JOIN ${link.name.toUpperCase()}
    </button>`;
  });

  container.innerHTML = html;
}

// ─────────────────────────────────────────────────────────
// Realtime subscription — re-renders everything on any change
// ─────────────────────────────────────────────────────────
function setupRealtimeSubscription() {
  if (!window.supabaseClient) return;

  window.supabaseClient
    .channel('public:plans')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, payload => {
      console.log('[supabase-data] Realtime update received:', payload);
      fetchAndRenderPlans();
    })
    .subscribe(status => {
      console.log('[supabase-data] Realtime status:', status);
    });
}

// ─────────────────────────────────────────────────────────
// Global copy helper — used by dynamically rendered cards
// ─────────────────────────────────────────────────────────
window.copyText = function(text) {
  try {
    navigator.clipboard.writeText(text);
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = `Copied: ${text}`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    } else {
      alert('Copied: ' + text);
    }
  } catch (e) {
    console.error('[supabase-data] Clipboard copy failed', e);
  }
};

// Expose functions globally so admin.html can call them if needed
window.fetchAndRenderPlans      = fetchAndRenderPlans;
window.renderContactPageDetails = renderContactPageDetails;
window.renderFreePageLinks      = renderFreePageLinks;
