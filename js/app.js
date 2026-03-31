/**
 * Money Transfer Japan - Main Application
 * Compares money transfer services from Japan for expats
 */

(function () {
  'use strict';

  // === Constants ===
  const API_URL = 'https://open.er-api.com/v6/latest/JPY';
  const CACHE_KEY = 'mtj_exchange_rates';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // === State ===
  let services = [];
  let exchangeRates = null;
  let currentSort = 'recipient_amount';

  // === Popular destination currencies ===
  const CURRENCIES = [
    { code: 'USD', name: 'United States (USD)', flag: '\ud83c\uddfa\ud83c\uddf8' },
    { code: 'EUR', name: 'Europe (EUR)', flag: '\ud83c\uddea\ud83c\uddfa' },
    { code: 'GBP', name: 'United Kingdom (GBP)', flag: '\ud83c\uddec\ud83c\udde7' },
    { code: 'PHP', name: 'Philippines (PHP)', flag: '\ud83c\uddf5\ud83c\udded' },
    { code: 'VND', name: 'Vietnam (VND)', flag: '\ud83c\uddfb\ud83c\uddf3' },
    { code: 'THB', name: 'Thailand (THB)', flag: '\ud83c\uddf9\ud83c\udded' },
    { code: 'INR', name: 'India (INR)', flag: '\ud83c\uddee\ud83c\uddf3' },
    { code: 'IDR', name: 'Indonesia (IDR)', flag: '\ud83c\uddee\ud83c\udde9' },
    { code: 'BRL', name: 'Brazil (BRL)', flag: '\ud83c\udde7\ud83c\uddf7' },
    { code: 'AUD', name: 'Australia (AUD)', flag: '\ud83c\udde6\ud83c\uddfa' },
    { code: 'CAD', name: 'Canada (CAD)', flag: '\ud83c\udde8\ud83c\udde6' },
    { code: 'KRW', name: 'South Korea (KRW)', flag: '\ud83c\uddf0\ud83c\uddf7' },
    { code: 'CNY', name: 'China (CNY)', flag: '\ud83c\udde8\ud83c\uddf3' },
    { code: 'SGD', name: 'Singapore (SGD)', flag: '\ud83c\uddf8\ud83c\uddec' },
    { code: 'MYR', name: 'Malaysia (MYR)', flag: '\ud83c\uddf2\ud83c\uddfe' },
    { code: 'NZD', name: 'New Zealand (NZD)', flag: '\ud83c\uddf3\ud83c\uddff' },
    { code: 'CHF', name: 'Switzerland (CHF)', flag: '\ud83c\udde8\ud83c\udded' },
    { code: 'NPR', name: 'Nepal (NPR)', flag: '\ud83c\uddf3\ud83c\uddf5' },
    { code: 'BDT', name: 'Bangladesh (BDT)', flag: '\ud83c\udde7\ud83c\udde9' },
    { code: 'LKR', name: 'Sri Lanka (LKR)', flag: '\ud83c\uddf1\ud83c\uddf0' },
    { code: 'MMK', name: 'Myanmar (MMK)', flag: '\ud83c\uddf2\ud83c\uddf2' },
    { code: 'HKD', name: 'Hong Kong (HKD)', flag: '\ud83c\udded\ud83c\uddf0' }
  ];

  // === Init ===
  document.addEventListener('DOMContentLoaded', async function () {
    setupNavigation();
    populateCurrencySelect();
    await loadServices();
    await loadExchangeRates();
    setupEventListeners();
  });

  // === Navigation ===
  function setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = this.dataset.section;
        tabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        document.querySelectorAll('.section').forEach(function (s) { s.classList.remove('active'); });
        document.getElementById(target).classList.add('active');
        gtag('event', 'transfer_compared', {tab: target.replace('-section', '')});
      });
    });
  }

  // === Populate Currency Dropdown ===
  function populateCurrencySelect() {
    var select = document.getElementById('currency');
    CURRENCIES.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.code;
      opt.textContent = c.flag + ' ' + c.name;
      select.appendChild(opt);
    });
  }

  // === Load Services Data ===
  async function loadServices() {
    try {
      var resp = await fetch('data/services.json');
      services = await resp.json();
    } catch (e) {
      console.error('Failed to load services:', e);
      services = [];
    }
  }

  // === Exchange Rate (with 24h cache) ===
  async function loadExchangeRates() {
    // Check cache
    var cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        var parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          exchangeRates = parsed.rates;
          updateRateInfo(parsed.timestamp);
          return;
        }
      } catch (e) { /* cache invalid, fetch fresh */ }
    }
    await fetchExchangeRates();
  }

  async function fetchExchangeRates() {
    try {
      var resp = await fetch(API_URL);
      var data = await resp.json();
      if (data.result === 'success' && data.rates) {
        exchangeRates = data.rates;
        var now = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          rates: data.rates,
          timestamp: now
        }));
        updateRateInfo(now);
      } else {
        showRateError();
      }
    } catch (e) {
      console.error('Failed to fetch exchange rates:', e);
      showRateError();
    }
  }

  function updateRateInfo(timestamp) {
    var el = document.getElementById('rate-info');
    if (!el) return;
    var d = new Date(timestamp);
    el.textContent = 'Exchange rates last updated: ' + d.toLocaleString('en-US', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  }

  function showRateError() {
    var el = document.getElementById('rate-info');
    if (!el) return;
    el.textContent = '';
    el.appendChild(document.createTextNode('Could not fetch live rates. '));
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Try again';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      location.reload();
    });
    el.appendChild(link);
  }

  // === Event Listeners ===
  function setupEventListeners() {
    document.getElementById('compare-btn').addEventListener('click', compareServices);
    document.getElementById('sort-by').addEventListener('change', function () {
      currentSort = this.value;
      compareServices();
    });

    // Allow Enter key in amount field
    document.getElementById('amount').addEventListener('keypress', function (e) {
      if (e.key === 'Enter') compareServices();
    });
  }

  // === Compare Services ===
  function compareServices() {
    var amountJPY = parseFloat(document.getElementById('amount').value);
    var currency = document.getElementById('currency').value;

    if (!amountJPY || amountJPY <= 0) {
      alert('Please enter a valid amount in JPY.');
      return;
    }

    if (!exchangeRates) {
      document.getElementById('results').innerHTML =
        '<div class="no-results"><div class="no-results-icon">&#x26A0;&#xFE0F;</div>' +
        '<p>Exchange rates not available. Please refresh the page.</p></div>';
      return;
    }

    var midRate = exchangeRates[currency];
    gtag('event', 'transfer_compared', {tab: 'compare', destination_currency: currency});
    if (!midRate) {
      document.getElementById('results').innerHTML =
        '<div class="no-results"><div class="no-results-icon">&#x2753;</div>' +
        '<p>Currency ' + currency + ' not available.</p></div>';
      return;
    }

    // Calculate for each service
    var results = [];
    services.forEach(function (svc) {
      var supported = svc.supported_currencies.indexOf(currency) !== -1;
      if (!supported) return;

      var fee = calculateFee(svc, amountJPY);
      var effectiveRate = getEffectiveRate(svc, midRate);
      var amountAfterFee = amountJPY - fee;
      var recipientAmount = amountAfterFee * effectiveRate;
      var totalCostJPY = fee + (amountJPY - fee) * (1 - effectiveRate / midRate);

      results.push({
        service: svc,
        fee: fee,
        effectiveRate: effectiveRate,
        midRate: midRate,
        recipientAmount: recipientAmount,
        totalCostJPY: totalCostJPY,
        currency: currency
      });
    });

    // Sort
    if (currentSort === 'recipient_amount') {
      results.sort(function (a, b) { return b.recipientAmount - a.recipientAmount; });
    } else if (currentSort === 'fee') {
      results.sort(function (a, b) { return a.fee - b.fee; });
    } else if (currentSort === 'speed') {
      results.sort(function (a, b) { return a.service.speed_days_min - b.service.speed_days_min; });
    }

    renderResults(results, amountJPY, currency);
  }

  // === Fee Calculation ===
  function calculateFee(svc, amountJPY) {
    var fee = 0;
    if (svc.fee_type === 'percentage') {
      fee = amountJPY * (svc.fee_percentage / 100);
    } else if (svc.fee_type === 'fixed') {
      fee = svc.fee_fixed_jpy;
    } else if (svc.fee_type === 'mixed') {
      fee = amountJPY * (svc.fee_percentage / 100) + svc.fee_fixed_jpy;
    }
    if (svc.fee_min_jpy && fee < svc.fee_min_jpy) {
      fee = svc.fee_min_jpy;
    }
    return fee;
  }

  // === Effective Rate (applying markup) ===
  function getEffectiveRate(svc, midRate) {
    if (svc.uses_mid_market_rate) return midRate;
    var markup = svc.rate_markup_percentage / 100;
    return midRate * (1 - markup);
  }

  // === Render Results ===
  function renderResults(results, amountJPY, currency) {
    var container = document.getElementById('results');

    if (results.length === 0) {
      container.innerHTML =
        '<div class="no-results"><div class="no-results-icon">&#x1F50D;</div>' +
        '<p>No services found for ' + currency + '. Try a different destination currency.</p></div>';
      return;
    }

    var bestIdx = 0;
    var bestAmount = results[0].recipientAmount;
    for (var i = 1; i < results.length; i++) {
      if (results[i].recipientAmount > bestAmount) {
        bestAmount = results[i].recipientAmount;
        bestIdx = i;
      }
    }

    var html = '';
    results.forEach(function (r, idx) {
      var isBest = (idx === bestIdx);
      html += renderServiceCard(r, isBest, amountJPY);
    });

    container.innerHTML = html;
    document.getElementById('results-area').style.display = 'block';
  }

  function renderServiceCard(r, isBest, amountJPY) {
    var svc = r.service;
    var stars = '';
    for (var i = 0; i < 5; i++) {
      stars += i < svc.safety_rating ? '\u2605' : '\u2606';
    }

    var prosHtml = '';
    svc.pros.forEach(function (p) {
      prosHtml += '<span class="pro-tag">\u2713 ' + escHtml(p) + '</span>';
    });
    svc.cons.slice(0, 2).forEach(function (c) {
      prosHtml += '<span class="con-tag">\u2717 ' + escHtml(c) + '</span>';
    });

    var formatRecipient = formatCurrency(r.recipientAmount, r.currency);
    var formatFee = '\u00a5' + formatNumber(Math.round(r.fee));

    return '<div class="service-card' + (isBest ? ' best-value' : '') + '">' +
      (isBest ? '<div class="best-badge">\u2b50 Best Value</div>' : '') +
      '<div class="service-header">' +
      '<div class="service-emoji">' + svc.logo_emoji + '</div>' +
      '<div><div class="service-name">' + escHtml(svc.name) + '</div>' +
      '<div class="service-speed">\u23f1 ' + escHtml(svc.speed_label) + '</div></div></div>' +
      '<div class="service-details">' +
      '<div class="detail-item"><div class="detail-label">You Send</div>' +
      '<div class="detail-value">\u00a5' + formatNumber(amountJPY) + '</div></div>' +
      '<div class="detail-item"><div class="detail-label">Fee</div>' +
      '<div class="detail-value">' + formatFee + '</div></div>' +
      '<div class="detail-item"><div class="detail-label">Exchange Rate</div>' +
      '<div class="detail-value">1 JPY = ' + r.effectiveRate.toFixed(6) + ' ' + r.currency + '</div></div>' +
      '<div class="detail-item"><div class="detail-label">They Receive</div>' +
      '<div class="detail-value highlight">' + formatRecipient + '</div></div></div>' +
      '<div class="service-pros">' + prosHtml + '</div>' +
      '<div class="safety-stars">Safety: ' + stars + ' <small>' + escHtml(svc.safety_note) + '</small></div>' +
      '<a href="' + escHtml(svc.affiliate_url) + '" target="_blank" rel="nofollow sponsored noopener" class="service-cta" style="margin-top:0.75rem;">' +
      escHtml(svc.cta_text) + ' \u2192</a></div>';
  }

  // === Helpers ===
  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function formatCurrency(amount, code) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      return amount.toFixed(2) + ' ' + code;
    }
  }

  function escHtml(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  // Expose for inline onclick
  window.compareServices = compareServices;
})();
