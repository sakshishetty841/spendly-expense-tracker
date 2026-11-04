/**
 * ==============================================================================
 * SPENDLY - SMART EXPENSE MANAGER
 * File: js/dashboard.js
 * Description: Computes dashboard statistics, monthly budget overview,
 *              and renders dashboard UI summaries.
 * Concepts: reduce(), filter(), slice(), DOM manipulation
 * ==============================================================================
 */

// Global state for monthly budget
let monthlyBudget = 6000;

// Curated college student financial tips for rotating display
const STUDENT_FINANCIAL_TIPS = [
  "Track small daily expenses like chai and snacks—they can easily account for 25% of your monthly allowance!",
  "The 50/30/20 Rule: Allocate 50% for needs, 30% for wants, and save at least 20% for future semesters.",
  "Check college library portals and seniors for second-hand textbooks before buying brand new ones.",
  "Opt for semester or monthly student transit passes for bus and metro instead of daily single tickets.",
  "Cook with flatmates or eat at the campus mess instead of ordering food deliveries multiple times a week.",
  "Use UPI apps with spending insights, but set a daily spend limit to avoid impulsive late-night shopping."
];

/**
 * Initializes the budget state from LocalStorage.
 */
function initBudget() {
  monthlyBudget = loadBudget();
}

/**
 * Calculates the sum of all expenses in a given list.
 * Demonstrates: Array reduce() method.
 * 
 * @param {Array} list - Array of expense objects
 * @returns {number} Total sum
 */
function calculateTotal(list) {
  if (!Array.isArray(list) || list.length === 0) return 0;
  return list.reduce((accumulator, expense) => {
    return accumulator + (Number(expense.amount) || 0);
  }, 0);
}

/**
 * Calculates the total spending for a specific year and month.
 * Demonstrates: Array filter() followed by reduce().
 * 
 * @param {Array} list - Array of expense objects
 * @param {string} yearMonth - Format 'YYYY-MM'
 * @returns {number} Total spent in specified month
 */
function calculateMonthlyTotal(list, yearMonth) {
  if (!Array.isArray(list) || list.length === 0) return 0;

  // Filter expenses matching current month prefix
  const monthlyExpenses = list.filter(item => {
    return item.date && item.date.startsWith(yearMonth);
  });

  return calculateTotal(monthlyExpenses);
}

/**
 * Updates the monthly spending budget and synchronizes with storage.
 * 
 * @param {number} newBudget - New monthly budget limit
 */
function updateBudget(newBudget) {
  const num = Number(newBudget);
  if (isNaN(num) || num <= 0) {
    showToast('Please enter a valid budget amount greater than ₹0.', 'error');
    return false;
  }

  monthlyBudget = num;
  saveBudget(monthlyBudget);

  // Re-render UI
  if (typeof render === 'function') {
    render();
  }

  showToast(`Monthly budget updated to ${formatCurrency(monthlyBudget)}`, 'success');
  return true;
}

/**
 * Renders the dashboard view with live statistics.
 * Demonstrates: reduce(), map(), sort(), dynamic DOM element generation.
 */
function renderDashboard() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
  const currentYearMonth = `${currentYear}-${currentMonthNum}`;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[now.getMonth()];

  // 1. Calculate Summary Metrics
  const totalSpend = calculateTotal(expenses);
  const thisMonthSpend = calculateMonthlyTotal(expenses, currentYearMonth);
  const remainingBudget = monthlyBudget - thisMonthSpend;
  const totalCount = expenses.length;

  // Calculate budget utilization percentage
  const budgetPercent = monthlyBudget > 0 
    ? Math.round((thisMonthSpend / monthlyBudget) * 100) 
    : 0;

  // 2. Update Metric DOM Elements
  const totalExpEl = document.getElementById('metric-total-expenses');
  const monthSpendEl = document.getElementById('metric-month-spending');
  const monthNameEl = document.getElementById('metric-month-name');
  const remainingBudgetEl = document.getElementById('metric-remaining-budget');
  const budgetLimitSubtext = document.getElementById('budget-limit-subtext');
  const totalCountEl = document.getElementById('metric-total-count');
  const budgetStatusBadge = document.getElementById('budget-status-badge');

  if (totalExpEl) totalExpEl.textContent = formatCurrency(totalSpend);
  if (monthSpendEl) monthSpendEl.textContent = formatCurrency(thisMonthSpend);
  if (monthNameEl) monthNameEl.textContent = `In ${currentMonthName} ${currentYear}`;
  if (budgetLimitSubtext) budgetLimitSubtext.textContent = `Limit: ${formatCurrency(monthlyBudget)}`;
  if (totalCountEl) totalCountEl.textContent = totalCount;

  // Budget remaining styling & badge status
  if (remainingBudgetEl) {
    if (remainingBudget >= 0) {
      remainingBudgetEl.textContent = formatCurrency(remainingBudget);
      remainingBudgetEl.classList.remove('text-error');
    } else {
      // Over budget
      remainingBudgetEl.textContent = `-${formatCurrency(Math.abs(remainingBudget))}`;
      remainingBudgetEl.classList.add('text-error');
    }
  }

  if (budgetStatusBadge) {
    if (budgetPercent >= 100) {
      budgetStatusBadge.className = 'badge badge-danger';
      budgetStatusBadge.textContent = 'Exceeded!';
    } else if (budgetPercent >= 80) {
      budgetStatusBadge.className = 'badge badge-warning';
      budgetStatusBadge.textContent = 'Near Limit';
    } else {
      budgetStatusBadge.className = 'badge badge-success';
      budgetStatusBadge.textContent = 'On Track';
    }
  }

  // 3. Update Dashboard Budget Utilization Banner
  const dashBudgetTitle = document.getElementById('dashboard-budget-title');
  const dashBudgetPct = document.getElementById('dashboard-budget-pct');
  const dashProgressFill = document.getElementById('dashboard-progress-fill');
  const dashBudgetAlert = document.getElementById('dashboard-budget-alert');

  if (dashBudgetTitle) {
    dashBudgetTitle.textContent = `${formatCurrency(thisMonthSpend)} spent of ${formatCurrency(monthlyBudget)} budget`;
  }
  if (dashBudgetPct) {
    dashBudgetPct.textContent = `${budgetPercent}% Used`;
  }

  if (dashProgressFill) {
    // Clamp visual width to 100% for progress bar
    const visualWidth = Math.min(budgetPercent, 100);
    dashProgressFill.style.width = `${visualWidth}%`;

    // Apply color class based on threshold
    dashProgressFill.className = 'progress-bar-fill';
    if (budgetPercent >= 100) {
      dashProgressFill.classList.add('progress-fill-danger');
    } else if (budgetPercent >= 80) {
      dashProgressFill.classList.add('progress-fill-warning');
    } else {
      dashProgressFill.classList.add('progress-fill-safe');
    }
  }

  if (dashBudgetAlert) {
    if (budgetPercent >= 100) {
      dashBudgetAlert.innerHTML = `🚨 <strong class="text-error">Attention:</strong> You have exceeded your monthly limit by ${formatCurrency(Math.abs(remainingBudget))}! Cut down non-essential spend.`;
    } else if (budgetPercent >= 80) {
      dashBudgetAlert.innerHTML = `⚠️ <strong class="text-warning">Caution:</strong> You have used ${budgetPercent}% of your budget. Only ${formatCurrency(remainingBudget)} left this month.`;
    } else {
      dashBudgetAlert.textContent = `Good job! You have ${100 - budgetPercent}% (${formatCurrency(remainingBudget)}) of your monthly budget remaining.`;
    }
  }

  // 4. Render Top Spending Categories Mini Preview
  renderDashboardCategories(totalSpend);

  // 5. Render Recent Transactions List
  renderDashboardRecentTransactions();

  // 6. Rotate Tip of the Day
  renderDashboardTip();

  // 7. Synchronize Budget Page Elements
  renderBudgetPage(thisMonthSpend, remainingBudget, budgetPercent, currentMonthName, currentYear);
}

/**
 * Renders the top categories mini horizontal breakdown on the dashboard.
 * 
 * @param {number} totalSpend 
 */
function renderDashboardCategories(totalSpend) {
  const container = document.getElementById('dashboard-categories-container');
  if (!container) return;

  if (expenses.length === 0 || totalSpend === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 10px;">
        <p class="empty-desc">No expenses recorded yet. Add your first expense to see your category breakdown!</p>
      </div>
    `;
    return;
  }

  // Calculate category totals
  const categoryTotals = calculateCategoryTotals(expenses);

  // Sort categories by amount descending and take top 4
  const sortedCategories = Object.entries(categoryTotals)
    .filter(([_, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (sortedCategories.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align: center; padding: 20px;">No category data available.</p>';
    return;
  }

  const html = sortedCategories.map(([category, amount]) => {
    const icon = CATEGORY_ICONS[category] || '🏷️';
    const percent = Math.round((amount / totalSpend) * 100) || 0;

    return `
      <div class="category-mini-item">
        <div class="cat-mini-header">
          <span>${icon} ${category}</span>
          <div>
            <span class="cat-mini-amount">${formatCurrency(amount)}</span>
            <span class="cat-mini-percent">(${percent}%)</span>
          </div>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width: ${percent}%;"></div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

/**
 * Renders the latest 5 transactions on the dashboard.
 */
function renderDashboardRecentTransactions() {
  const container = document.getElementById('dashboard-recent-list');
  if (!container) return;

  if (expenses.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 10px;">
        <p class="empty-desc">No recent transactions to display.</p>
      </div>
    `;
    return;
  }

  // Sort by date descending and take top 5
  const recent = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const html = recent.map(exp => {
    const icon = CATEGORY_ICONS[exp.category] || '🏷️';
    return `
      <div class="recent-item">
        <div class="recent-left">
          <div class="recent-icon-box">${icon}</div>
          <div class="recent-details">
            <span class="recent-title">${escapeHtml(exp.title)}</span>
            <span class="recent-meta">${formatDate(exp.date)} • ${escapeHtml(exp.payment)}</span>
          </div>
        </div>
        <span class="recent-amount">${formatCurrency(exp.amount)}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

/**
 * Rotates or selects a financial tip for students.
 */
function renderDashboardTip() {
  const tipEl = document.getElementById('dashboard-tip-text');
  if (!tipEl) return;

  // Pick a consistent tip based on day of month
  const dayIndex = new Date().getDate() % STUDENT_FINANCIAL_TIPS.length;
  tipEl.textContent = `"${STUDENT_FINANCIAL_TIPS[dayIndex]}"`;
}

/**
 * Updates the dedicated Budget Management page.
 */
function renderBudgetPage(spent, remaining, percent, monthName, year) {
  const heroMonth = document.getElementById('budget-hero-month');
  const limitDisplay = document.getElementById('budget-limit-display');
  const spentDisplay = document.getElementById('budget-spent-display');
  const remainingDisplay = document.getElementById('budget-remaining-display');
  const statusPill = document.getElementById('budget-status-pill');
  const progressBar = document.getElementById('budget-main-progress-bar');
  const pctText = document.getElementById('budget-percentage-text');
  const warningBanner = document.getElementById('budget-warning-banner');
  const warningText = document.getElementById('budget-warning-text');
  const budgetInput = document.getElementById('monthly-budget-input');
  const settingsBudgetLabel = document.getElementById('settings-budget-label');

  if (heroMonth) heroMonth.textContent = `${monthName} ${year}`;
  if (limitDisplay) limitDisplay.textContent = formatCurrency(monthlyBudget);
  if (spentDisplay) spentDisplay.textContent = formatCurrency(spent);
  if (budgetInput && !budgetInput.value) budgetInput.value = monthlyBudget;
  if (settingsBudgetLabel) settingsBudgetLabel.textContent = `${formatCurrency(monthlyBudget)} per month`;

  if (remainingDisplay) {
    if (remaining >= 0) {
      remainingDisplay.textContent = formatCurrency(remaining);
      remainingDisplay.className = 'budget-stat-val text-success';
    } else {
      remainingDisplay.textContent = `-${formatCurrency(Math.abs(remaining))}`;
      remainingDisplay.className = 'budget-stat-val text-error';
    }
  }

  if (pctText) {
    pctText.textContent = `${percent}% utilized`;
  }

  if (progressBar) {
    const visualWidth = Math.min(percent, 100);
    progressBar.style.width = `${visualWidth}%`;
    progressBar.className = 'progress-bar-fill';
    if (percent >= 100) {
      progressBar.classList.add('progress-fill-danger');
    } else if (percent >= 80) {
      progressBar.classList.add('progress-fill-warning');
    } else {
      progressBar.classList.add('progress-fill-safe');
    }
  }

  if (statusPill && warningBanner && warningText) {
    if (percent >= 100) {
      statusPill.textContent = 'Over Budget';
      statusPill.className = 'budget-pill pill-danger';
      warningBanner.className = 'budget-callout callout-danger';
      warningBanner.querySelector('.callout-icon').textContent = '🚨';
      warningText.textContent = `Warning: You have exceeded your monthly budget by ${formatCurrency(Math.abs(remaining))}! Consider halting non-critical spending until next month.`;
    } else if (percent >= 80) {
      statusPill.textContent = 'Near Limit';
      statusPill.className = 'budget-pill pill-warning';
      warningBanner.className = 'budget-callout callout-warning';
      warningBanner.querySelector('.callout-icon').textContent = '⚠️';
      warningText.textContent = `Caution: You have utilized ${percent}% of your monthly budget. You have ${formatCurrency(remaining)} left for the rest of ${monthName}.`;
    } else {
      statusPill.textContent = 'Within Budget';
      statusPill.className = 'budget-pill pill-safe';
      warningBanner.className = 'budget-callout callout-info';
      warningBanner.querySelector('.callout-icon').textContent = 'ℹ️';
      warningText.textContent = `You have used ${percent}% of your allocated monthly budget. Your spending is disciplined and on track!`;
    }
  }
}

