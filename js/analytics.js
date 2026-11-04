/**
 * ==============================================================================
 * SPENDLY - SMART EXPENSE MANAGER
 * File: js/analytics.js
 * Description: Spending analytics calculations, category horizontal bar charts,
 *              and payment method breakdown using pure CSS and JavaScript.
 * Concepts: reduce(), map(), Object.entries(), Math calculations, DOM generation
 * ==============================================================================
 */

/**
 * Standard expense categories supported in Spendly.
 */
const ALL_CATEGORIES = [
  'Food',
  'Shopping',
  'Travel',
  'Education',
  'Entertainment',
  'Bills',
  'Other'
];

/**
 * Calculates total spending grouped by category.
 * Demonstrates: Array reduce() producing an accumulator object.
 * 
 * @param {Array} list - Array of expense objects
 * @returns {Object} { Food: number, Shopping: number, ... }
 */
function calculateCategoryTotals(list) {
  // Initialize map with all categories set to 0
  const totals = {};
  ALL_CATEGORIES.forEach(cat => {
    totals[cat] = 0;
  });

  if (!Array.isArray(list) || list.length === 0) {
    return totals;
  }

  // Use reduce() to tally amounts
  return list.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    const amount = Number(expense.amount) || 0;

    if (acc[category] !== undefined) {
      acc[category] += amount;
    } else {
      acc['Other'] = (acc['Other'] || 0) + amount;
    }
    return acc;
  }, totals);
}

/**
 * Calculates total spending grouped by payment method.
 * Demonstrates: Array reduce().
 * 
 * @param {Array} list 
 * @returns {Object}
 */
function calculatePaymentTotals(list) {
  const paymentMethods = ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Other'];
  const totals = {};
  paymentMethods.forEach(method => totals[method] = 0);

  if (!Array.isArray(list) || list.length === 0) {
    return totals;
  }

  return list.reduce((acc, exp) => {
    const method = exp.payment || 'Other';
    const amount = Number(exp.amount) || 0;
    if (acc[method] !== undefined) {
      acc[method] += amount;
    } else {
      acc['Other'] = (acc['Other'] || 0) + amount;
    }
    return acc;
  }, totals);
}

/**
 * Renders the Analytics view including summary stats, horizontal bars,
 * payment distribution, and smart financial observations.
 */
function renderAnalytics() {
  const totalSpendEl = document.getElementById('analytics-total-spend');
  const monthSpendEl = document.getElementById('analytics-month-spend');
  const topCategoryEl = document.getElementById('analytics-top-category');
  const topCatAmountEl = document.getElementById('analytics-top-category-amount');
  const avgSpendEl = document.getElementById('analytics-avg-spend');
  const countEl = document.getElementById('analytics-count');
  const barsContainer = document.getElementById('analytics-bars-container');
  const paymentContainer = document.getElementById('analytics-payment-breakdown');
  const insightsContainer = document.getElementById('analytics-insights-container');

  if (!totalSpendEl) return;

  const count = expenses.length;
  const totalSpend = calculateTotal(expenses);

  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthSpend = calculateMonthlyTotal(expenses, currentYearMonth);

  // Average expense calculation
  const avgSpend = count > 0 ? Math.round(totalSpend / count) : 0;

  // Category totals
  const categoryTotals = calculateCategoryTotals(expenses);

  // Find highest spending category using reduce
  let topCategory = '-';
  let topAmount = 0;

  Object.entries(categoryTotals).forEach(([cat, amount]) => {
    if (amount > topAmount) {
      topAmount = amount;
      topCategory = cat;
    }
  });

  // 1. Update Top Metric Cards
  totalSpendEl.textContent = formatCurrency(totalSpend);
  monthSpendEl.textContent = formatCurrency(monthSpend);
  if (topCategoryEl) {
    topCategoryEl.textContent = topCategory !== '-' ? `${CATEGORY_ICONS[topCategory] || ''} ${topCategory}` : '-';
  }
  if (topCatAmountEl) {
    topCatAmountEl.textContent = topAmount > 0 ? `${formatCurrency(topAmount)} spent` : '₹0 spent';
  }
  if (avgSpendEl) avgSpendEl.textContent = formatCurrency(avgSpend);
  if (countEl) countEl.textContent = count;

  // 2. Render Horizontal Bar Chart for all 7 Categories
  renderCategoryBars(barsContainer, categoryTotals, totalSpend);

  // 3. Render Payment Method Breakdown
  renderPaymentBreakdown(paymentContainer, totalSpend);

  // 4. Render Automated Financial Insights
  renderAutomatedInsights(insightsContainer, totalSpend, topCategory, topAmount, count, avgSpend);
}

/**
 * Renders category horizontal bars with animated percentages and amount badges.
 * Demonstrates: map(), Object.entries(), template literals, CSS flex/grid.
 * 
 * @param {HTMLElement} container 
 * @param {Object} categoryTotals 
 * @param {number} totalSpend 
 */
function renderCategoryBars(container, categoryTotals, totalSpend) {
  if (!container) return;

  if (totalSpend === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 10px;">
        <p class="empty-desc">No expense records available to generate category analytics.</p>
      </div>
    `;
    return;
  }

  // Sort categories by amount descending
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  const barsHtml = sortedCategories.map(([category, amount]) => {
    const icon = CATEGORY_ICONS[category] || '🏷️';
    const percent = totalSpend > 0 ? ((amount / totalSpend) * 100).toFixed(1) : 0;
    const roundedPct = Math.round(percent);

    return `
      <div class="cat-bar-row">
        <div class="cat-bar-info">
          <span class="cat-bar-name">${icon} ${category}</span>
          <div class="cat-bar-stats">
            <span class="cat-bar-amount">${formatCurrency(amount)}</span>
            <span class="cat-bar-pct">${percent}%</span>
          </div>
        </div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width: ${roundedPct}%;"></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = barsHtml;
}

/**
 * Renders the payment method breakdown list.
 * 
 * @param {HTMLElement} container 
 * @param {number} totalSpend 
 */
function renderPaymentBreakdown(container, totalSpend) {
  if (!container) return;

  if (totalSpend === 0) {
    container.innerHTML = '<p class="text-muted" style="padding: 10px 0;">No payment data recorded yet.</p>';
    return;
  }

  const paymentTotals = calculatePaymentTotals(expenses);

  // Sort by highest amount
  const sortedPayments = Object.entries(paymentTotals)
    .sort((a, b) => b[1] - a[1]);

  const html = sortedPayments.map(([method, amount]) => {
    const icon = PAYMENT_ICONS[method] || '💳';
    const percent = totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0;

    return `
      <div class="payment-row">
        <div class="payment-row-left">
          <span>${icon}</span>
          <span>${method}</span>
          <span class="badge badge-accent" style="font-size: 0.7rem;">${percent}%</span>
        </div>
        <span class="payment-row-amount">${formatCurrency(amount)}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

/**
 * Generates automated intelligent observations based on recorded data.
 */
function renderAutomatedInsights(container, totalSpend, topCategory, topAmount, count, avgSpend) {
  if (!container) return;

  if (count === 0) {
    container.innerHTML = '<p class="text-muted" style="padding: 10px 0;">Add expenses to view smart insights.</p>';
    return;
  }

  const topPercent = totalSpend > 0 ? Math.round((topAmount / totalSpend) * 100) : 0;
  const insights = [];

  // Insight 1: Dominant Category
  if (topCategory !== '-') {
    insights.push(`<strong>${topCategory}</strong> represents your highest expense, taking up <strong>${topPercent}%</strong> of your all-time recorded budget.`);
  }

  // Insight 2: Average transaction size
  insights.push(`Your typical transaction size averages around <strong>${formatCurrency(avgSpend)}</strong> across ${count} logged expenses.`);

  // Insight 3: UPI vs Cash
  const paymentTotals = calculatePaymentTotals(expenses);
  const upiAmount = paymentTotals['UPI'] || 0;
  if (upiAmount > 0 && totalSpend > 0) {
    const upiPercent = Math.round((upiAmount / totalSpend) * 100);
    insights.push(`Digital UPI payments comprise <strong>${upiPercent}%</strong> of your transactions. Remember to review UPI passbooks regularly.`);
  }

  // Build HTML list
  const html = insights.map(text => {
    return `
      <div class="insight-card-item">
        <span style="font-size: 1rem;">📌</span>
        <div>${text}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

