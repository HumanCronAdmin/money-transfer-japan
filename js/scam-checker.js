/**
 * Money Transfer Japan - Scam Checker
 * Checks user input against known scam patterns targeting foreigners in Japan
 */

(function () {
  'use strict';

  let scamPatterns = [];

  // === Init ===
  document.addEventListener('DOMContentLoaded', async function () {
    await loadScamPatterns();
    setupScamChecker();
    renderCommonScams();
  });

  // === Load Patterns ===
  async function loadScamPatterns() {
    try {
      var resp = await fetch('data/scam-patterns.json');
      scamPatterns = await resp.json();
    } catch (e) {
      console.error('Failed to load scam patterns:', e);
      scamPatterns = [];
    }
  }

  // === Setup ===
  function setupScamChecker() {
    var btn = document.getElementById('scam-check-btn');
    if (btn) {
      btn.addEventListener('click', checkForScams);
    }

    var textarea = document.getElementById('scam-input');
    if (textarea) {
      textarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          checkForScams();
        }
      });
    }
  }

  // === Check for Scams ===
  function checkForScams() {
    var input = document.getElementById('scam-input').value.trim().toLowerCase();
    var resultsEl = document.getElementById('scam-results');

    gtag('event', 'scam_checked_transfer', {tab: 'scam'});
    if (!input) {
      resultsEl.innerHTML =
        '<div class="no-results"><div class="no-results-icon">\u270d\ufe0f</div>' +
        '<p>Enter a description of the situation or service name above.</p></div>';
      return;
    }

    var matches = [];
    scamPatterns.forEach(function (pattern) {
      var matchedKeywords = [];
      pattern.keywords.forEach(function (kw) {
        if (input.indexOf(kw.toLowerCase()) !== -1) {
          matchedKeywords.push(kw);
        }
      });
      if (matchedKeywords.length > 0) {
        matches.push({
          pattern: pattern,
          matchCount: matchedKeywords.length,
          matchedKeywords: matchedKeywords
        });
      }
    });

    // Sort: danger first, then caution, then safe. Within same level, more keyword matches first
    var riskOrder = { danger: 0, caution: 1, safe: 2 };
    matches.sort(function (a, b) {
      var riskDiff = riskOrder[a.pattern.risk_level] - riskOrder[b.pattern.risk_level];
      if (riskDiff !== 0) return riskDiff;
      return b.matchCount - a.matchCount;
    });

    renderScamResults(matches, resultsEl);
  }

  // === Render Scam Results ===
  function renderScamResults(matches, container) {
    if (matches.length === 0) {
      container.innerHTML =
        '<div class="scam-result safe">' +
        '<div class="scam-result-header">' +
        '<span class="risk-badge safe">No Matches Found</span></div>' +
        '<h3>No known scam patterns detected</h3>' +
        '<p>Your description did not match any known scam patterns in our database. However, always be cautious:</p>' +
        '<div class="advice">' +
        '<strong>General Safety Tips:</strong><br>' +
        '\u2022 Only use licensed money transfer services<br>' +
        '\u2022 Never send money to someone you haven\'t met in person<br>' +
        '\u2022 If it sounds too good to be true, it probably is<br>' +
        '\u2022 When in doubt, consult your local police or the <a href="https://www.fsa.go.jp/en/" target="_blank" rel="noopener">Japan FSA</a>' +
        '</div></div>';
      return;
    }

    var html = '';
    matches.forEach(function (m) {
      var p = m.pattern;
      var icon = '';
      if (p.risk_level === 'danger') icon = '\u26d4';
      else if (p.risk_level === 'caution') icon = '\u26a0\ufe0f';
      else icon = '\u2705';

      var examplesHtml = '';
      if (p.examples && p.examples.length > 0) {
        examplesHtml = '<div style="margin-top:0.5rem;font-size:0.85rem;">' +
          '<strong>Common examples:</strong><ul style="margin:0.3rem 0 0 1.2rem;">';
        p.examples.forEach(function (ex) {
          examplesHtml += '<li>' + escHtml(ex) + '</li>';
        });
        examplesHtml += '</ul></div>';
      }

      html += '<div class="scam-result ' + p.risk_level + '">' +
        '<div class="scam-result-header">' +
        '<span class="risk-badge ' + p.risk_level + '">' + icon + ' ' + p.risk_level.toUpperCase() + '</span></div>' +
        '<h3>' + escHtml(p.title) + '</h3>' +
        '<p>' + escHtml(p.description) + '</p>' +
        '<div class="advice"><strong>What to do:</strong> ' + escHtml(p.advice) + '</div>' +
        examplesHtml + '</div>';
    });

    container.innerHTML = html;
  }

  // === Render Common Scams Accordion ===
  function renderCommonScams() {
    var container = document.getElementById('common-scams-list');
    if (!container) return;

    // Filter to danger/caution patterns for the reference list
    var dangerPatterns = scamPatterns.filter(function (p) {
      return p.risk_level === 'danger' || p.risk_level === 'caution';
    });

    var html = '';
    dangerPatterns.forEach(function (p) {
      var icon = p.risk_level === 'danger' ? '\u26d4' : '\u26a0\ufe0f';
      html += '<div class="scam-item" onclick="this.classList.toggle(\'open\')">' +
        '<div class="scam-item-header">' +
        '<h3>' + icon + ' ' + escHtml(p.title) + '</h3>' +
        '<span class="chevron">\u25bc</span></div>' +
        '<div class="scam-item-body">' +
        '<p>' + escHtml(p.description) + '</p>' +
        '<p style="margin-top:0.5rem;"><strong>What to do:</strong> ' + escHtml(p.advice) + '</p>' +
        '</div></div>';
    });

    container.innerHTML = html;
  }

  // === Helper ===
  function escHtml(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }
})();
