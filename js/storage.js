/**
 * ==============================================================================
 * SPENDLY - SMART EXPENSE MANAGER
 * File: js/storage.js
 * Description: Handles data persistence using the browser's LocalStorage API.
 * Concepts: localStorage.setItem(), getItem(), JSON.stringify(), JSON.parse()
 * ==============================================================================
 */

// Storage keys used to namespace Spendly data in the browser
const STORAGE_KEY_EXPENSES = 'spendly_expenses_data';
const STORAGE_KEY_BUDGET = 'spendly_monthly_budget';
const STORAGE_KEY_THEME = 'spendly_theme_preference';

// Default initial monthly budget for college students in INR
const DEFAULT_MONTHLY_BUDGET = 6000;

/**
 * Sample realistic starter expenses for college students.
 * Used when the user visits the application for the first time.
 */
function getSampleExpenses() {
  const today = new Date();
  const formatSampleDate = (daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'exp_101',
      title: 'Campus Canteen Thali & Juice',
      amount: 160,
      category: 'Food',
      date: formatSampleDate(0), // Today
      payment: 'UPI',
      description: 'Lunch at the college food court with classmates.'
    },
    {
      id: 'exp_102',
      title: 'Data Structures & Algorithms Book',
      amount: 550,
      category: 'Education',
      date: formatSampleDate(1), // Yesterday
      payment: 'Debit Card',
      description: 'Prescribed reference book for semester exams.'
    },
    {
      id: 'exp_103',
      title: 'Metro Smart Card Recharge',
      amount: 400,
      category: 'Travel',
      date: formatSampleDate(2),
      payment: 'UPI',
      description: 'Monthly commute pass for daily college travel.'
    },
    {
      id: 'exp_104',
      title: 'Hostel Wi-Fi Subscription',
      amount: 500,
      category: 'Bills',
      date: formatSampleDate(3),
      payment: 'UPI',
      description: 'Shared room internet connection fee.'
    },
    {
      id: 'exp_105',
      title: 'Weekend Movie & Popcorn',
      amount: 320,
      category: 'Entertainment',
      date: formatSampleDate(4),
      payment: 'Credit Card',
      description: 'Saturday evening movie outing with friends.'
    },
    {
      id: 'exp_106',
      title: 'Lab Manuals & Practical Records',
      amount: 180,
      category: 'Education',
      date: formatSampleDate(5),
      payment: 'Cash',
      description: 'Stationery from the campus xerox shop.'
    },
    {
      id: 'exp_107',
      title: 'College Tech Fest Hoodie',
      amount: 650,
      category: 'Shopping',
      date: formatSampleDate(7),
      payment: 'UPI',
      description: 'Official department annual tech symposium merch.'
    },
    {
      id: 'exp_108',
      title: 'Evening Chai & Snacks',
      amount: 85,
      category: 'Food',
      date: formatSampleDate(8),
      payment: 'Cash',
      description: 'Tea break near library after afternoon lecture.'
    }
  ];
}

/**
 * Saves the current array of expense objects to LocalStorage.
 * Converts JavaScript array into a JSON string using JSON.stringify().
 * 
 * @param {Array} expenses - Array of expense objects
 */
function saveExpenses(expenses) {
  try {
    const jsonString = JSON.stringify(expenses);
    localStorage.setItem(STORAGE_KEY_EXPENSES, jsonString);
  } catch (error) {
    console.error('Error saving expenses to LocalStorage:', error);
  }
}

/**
 * Loads the saved expenses array from LocalStorage.
 * Parses the JSON string back into a JavaScript array using JSON.parse().
 * If no data exists, initializes with realistic student starter records.
 * 
 * @returns {Array} Array of expense objects
 */
function loadExpenses() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error parsing expenses from LocalStorage:', error);
  }

  // First time initialization: populate with sample data and save
  const initialData = getSampleExpenses();
  saveExpenses(initialData);
  return initialData;
}

/**
 * Saves monthly budget limit to LocalStorage.
 * @param {number} budget - Monthly budget amount in INR
 */
function saveBudget(budget) {
  try {
    localStorage.setItem(STORAGE_KEY_BUDGET, String(budget));
  } catch (error) {
    console.error('Error saving budget to LocalStorage:', error);
  }
}

/**
 * Retrieves monthly budget limit from LocalStorage.
 * @returns {number} Monthly budget in INR
 */
function loadBudget() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BUDGET);
    if (saved !== null && !isNaN(Number(saved)) && Number(saved) > 0) {
      return Number(saved);
    }
  } catch (error) {
    console.error('Error reading budget from LocalStorage:', error);
  }
  return DEFAULT_MONTHLY_BUDGET;
}

/**
 * Saves selected theme ('light' or 'dark') to LocalStorage.
 * @param {string} theme - 'light' | 'dark'
 */
function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (error) {
    console.error('Error saving theme to LocalStorage:', error);
  }
}

/**
 * Retrieves saved theme preference from LocalStorage.
 * @returns {string} 'light' or 'dark'
 */
function loadTheme() {
  try {
    const theme = localStorage.getItem(STORAGE_KEY_THEME);
    if (theme === 'dark' || theme === 'light') {
      return theme;
    }
  } catch (error) {
    console.error('Error loading theme preference:', error);
  }
  return 'light'; // Default theme
}

/**
 * Clears all expense records from LocalStorage.
 */
function clearAllExpensesStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY_EXPENSES);
  } catch (error) {
    console.error('Error clearing expenses from LocalStorage:', error);
  }
}

