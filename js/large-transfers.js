/**
 * Large Transfers Guide - Dynamic content generation
 */
(function () {
  'use strict';

  var tips = [
    {
      title: 'Tax Reporting: Know the Thresholds',
      body: 'Japan requires banks to report international transfers of 1,000,000 JPY or more to tax authorities. Transfers over 30,000,000 JPY may trigger additional scrutiny. This does not mean you owe tax — it means the transfer is on record. Keep documentation of the source of funds (savings statements, property sale records, inheritance documents).',
      tag: 'Required'
    },
    {
      title: 'Splitting Transfers: Pros and Cons',
      body: 'Splitting a large transfer into smaller ones can reduce per-transaction fees on some services (Wise caps at ~1,000,000 JPY per transfer). However, deliberately splitting to avoid reporting thresholds (called "structuring") is illegal. If your total is over 1M JPY, it will be reported regardless of how many transfers you make. Split only for fee optimization, not avoidance.',
      tag: 'Strategy'
    },
    {
      title: 'Best Services by Transfer Size',
      body: '<strong>Under 1M JPY:</strong> Wise or Revolut — lowest fees, best rates, fastest.<br><strong>1M - 5M JPY:</strong> Wise (multiple transfers) or OFX — OFX has no transfer limits and offers better rates for larger amounts.<br><strong>Over 5M JPY:</strong> Bank wire (SWIFT) or OFX — your bank may offer preferential rates for large amounts. Call and negotiate. Some banks waive fees for transfers above a threshold.',
      tag: 'Comparison'
    },
    {
      title: 'Currency Timing for Large Amounts',
      body: 'On a 5,000,000 JPY transfer, a 1% rate difference means 50,000 JPY. Do not rush. Monitor the exchange rate for a few days using the Compare tab. Consider splitting across multiple days to average out rate fluctuations (dollar-cost averaging). Services like OFX offer forward contracts to lock in a rate for future transfers.',
      tag: 'Strategy'
    },
    {
      title: 'Documents You May Need',
      body: '<strong>For the sending bank:</strong> proof of source (bank statements, sale contract, will/inheritance certificate).<br><strong>For the receiving bank in Japan:</strong> reason for remittance, relationship to sender, My Number (for residents).<br><strong>For tax filing:</strong> keep all transfer receipts. If funds are a gift over 1,100,000 JPY from a non-resident, gift tax may apply.',
      tag: 'Required'
    },
    {
      title: 'Receiving Large Transfers in Japan',
      body: 'Your Japanese bank may freeze the funds temporarily while verifying the transfer. This is normal for amounts over 1M JPY. Notify your bank in advance. Major banks (MUFG, SMBC, Mizuho) handle international wires daily. Shinsei Bank and Sony Bank are popular with expats for their English-language support and lower incoming wire fees.',
      tag: 'Tip'
    }
  ];

  var tagColors = {
    'Required': 'background:var(--danger-bg);color:var(--danger);',
    'Strategy': 'background:var(--success-bg);color:var(--success);',
    'Comparison': 'background:var(--primary-light);color:var(--primary);',
    'Tip': 'background:var(--warning-bg);color:var(--warning);'
  };

  function render() {
    var el = document.getElementById('large-tips');
    if (!el) return;
    el.innerHTML = tips.map(function (t) {
      var style = tagColors[t.tag] || '';
      return '<div class="input-card" style="margin-bottom:1rem;">' +
        '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">' +
        '<span style="' + style + 'padding:0.2rem 0.6rem;border-radius:20px;font-size:0.75rem;font-weight:600;">' + t.tag + '</span>' +
        '<h3 style="font-size:1rem;font-weight:600;">' + t.title + '</h3>' +
        '</div>' +
        '<p style="font-size:0.9rem;color:var(--text-secondary);line-height:1.6;">' + t.body + '</p>' +
        '</div>';
    }).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
