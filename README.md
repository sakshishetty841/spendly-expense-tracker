# SPENDLY – Smart Expense Manager

> **"Your money. Your control."**  
> *Web Technology Assignment 4 – Practical Project (15 Marks)*  
> *Second-Year BTech Computer Science & Engineering*

---

## 1. Project Introduction

**SPENDLY** is a responsive, nature-inspired personal expense management web application developed using semantic **HTML5**, **CSS3** (Flexbox and Grid), and **Vanilla JavaScript (ES6+)**. 

Designed specifically with college students and young adults in mind, Spendly offers an intuitive single-page dashboard where users can effortlessly record daily expenses, categorize transactions, track monthly spending against personalized budgets, view real-time horizontal spending analytics, and persist data across browser sessions using the browser's native `LocalStorage` API.

The visual identity is anchored on an elegant, calming **Sage Green & Warm Beige** color palette, engineered to deliver a focused and clutter-free personal finance experience.

---

## 2. Problem Statement

College students often face financial strain due to undisciplined spending on canteen snacks, transit, stationery, course materials, and weekend entertainment. Common challenges include:

1. **Lack of Visibility:** Difficulty keeping track of frequent micro-transactions (e.g., ₹20–₹100 payments via UPI).
2. **Impulsive Overspending:** Exceeding monthly parental allowances before the third week of the month without realizing where funds went.
3. **Complex Tools:** Mainstream banking and budgeting apps are cluttered with advertisements, investment promotions, and credit card solicitations, making simple daily expense tracking cumbersome.
4. **Data Privacy Concerns:** Many students hesitate to link bank accounts or upload financial history to third-party cloud backends.

---

## 3. Project Objectives

The core objectives of Spendly are:

- **Simplicity:** Provide a zero-friction, client-side expense logger that requires no server setup or external accounts.
- **Budget Discipline:** Allow students to configure an active monthly spending budget with real-time visual progress indicators and overspending warnings.
- **Visual Insights:** Deliver pure CSS/JS horizontal bar visualizations to highlight the top spending categories (e.g., Food, Travel, Education) without relying on heavy external charting libraries.
- **Academic Demonstration:** Showcase a thorough mastery of core Web Technology curriculum concepts:
  - Semantic HTML markup and accessible forms.
  - Modern CSS architecture (CSS custom properties, CSS Grid, Flexbox, media queries).
  - Clean Vanilla JavaScript (DOM manipulation, event delegation, ES6 array methods, CRUD operations, LocalStorage API).

---

## 4. Key Features

| Category | Feature | Description |
| :--- | :--- | :--- |
| **Dashboard** | 4 Summary Metric Cards | Real-time calculations of Total Expenses, Current Month Spend, Remaining Budget, and Total Transactions. |
| | Visual Budget Bar | Live utilization percentage with color-coded safety thresholds (Green `<80%`, Amber `80–99%`, Red `≥100%`). |
| | Top Categories Preview | Quick snapshot of top 4 expense drivers with proportional progress bars. |
| | Recent Transactions | Mini-feed of the 5 most recent logged transactions. |
| | Student Financial Tips | Rotating practical tips for student money management. |
| **Transactions** | Complete CRUD | Create, Read, Update, and Delete expense entries. |
| | Search & Filtering | Real-time search across titles/descriptions, category filtering, and dynamic month filtering. |
| | Multi-criteria Sorting | Sort by Newest First, Oldest First, Highest Amount, and Lowest Amount. |
| | Undo Deletion | 6-second interactive toast enabling users to restore an accidentally deleted expense. |
| **Add / Edit Form** | Strict Form Validation | Field validation for title length, positive numeric amount, category, date, and payment method. |
| | Dual-Mode Form | Single unified form dynamically toggles between "Add New Expense" and "Edit Expense Record". |
| **Analytics** | Pure CSS Bar Chart | Horizontal distribution bars for all 7 categories (Food, Shopping, Travel, Education, Entertainment, Bills, Other). |
| | Payment Distribution | Percentage and amount breakdown across UPI, Cash, Debit Card, Credit Card, and Other. |
| | Smart Insights | Automated observations summarizing dominant expense categories and spending patterns. |
| **Budget Planner** | Interactive Budgeting | Set/adjust monthly budget limits in INR (₹) with dynamic balance computation. |
| | Student Guidelines | Educational breakdown of the 50/30/20 rule and weekly budgeting techniques. |
| **Settings & Storage** | Dark / Light Theme | Seamless toggle between Sage Light and Forest Dark modes, persisted in LocalStorage. |
| | CSV Data Export | Generates and downloads standard `.csv` spreadsheet files of all expense records. |
| | Demo Data Loader | Populates realistic student sample transactions for evaluation demonstrations. |
| | Data Reset | Confirmation-protected wipe of all recorded local storage data. |

---

## 5. Technologies Used

- **HTML5:** Semantic tags (`<header>`, `<aside>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<table>`, `<dialog>`), strict form validation attributes, and ARIA accessibility labels.
- **CSS3:**
  - CSS Custom Properties (`--primary-sage`, `--deep-sage`, `--cream-bg`, etc.) for dynamic light/dark theming.
  - CSS Grid (`grid-template-columns`, `repeat()`, `gap`) for multi-column dashboards and metric card grids.
  - Flexbox for navigation, headers, toolbars, and responsive alignments.
  - Responsive Media Queries for desktops, tablets, and smartphones.
- **JavaScript (Vanilla ES6+):**
  - DOM Selection & Manipulation: `document.getElementById()`, `querySelector()`, `innerHTML`, `classList`.
  - Event Handling: `addEventListener()`, `event.preventDefault()`, and event delegation on dynamic tables.
  - ES6 Array Methods: `map()`, `filter()`, `reduce()`, `sort()`, `find()`, `findIndex()`, `slice()`.
  - Web Storage API: `localStorage.setItem()`, `localStorage.getItem()`, `localStorage.removeItem()`.
  - JSON API: `JSON.stringify()`, `JSON.parse()`.
  - Blob & URL APIs for native CSV export.

---

## 6. Project Folder Structure

```
spendly/
│
├── index.html              # Semantic HTML5 single-page application structure
│
├── css/
│   └── style.css           # Sage green & beige design system, variables, layouts, themes
│
├── js/
│   ├── storage.js          # LocalStorage CRUD wrappers, default budget, starter data
│   ├── expenses.js         # Core expense operations (Add, Edit, Delete, Undo, Filter, Sort, Render Table)
│   ├── dashboard.js        # Dashboard summary metric calculations, budget tracking, tips
│   ├── analytics.js        # Category horizontal bar charts, payment breakdown, smart insights
│   └── app.js              # Application entry point, view routing, form validation, theme, CSV export
│
├── assets/
│   └── images/
│       └── logo.svg        # Scalable vector logo (leaf sprout + rupee motif)
│
├── README.md               # Complete academic documentation & viva study guide
└── .gitignore              # Ignores system & editor artifacts (.DS_Store, etc.)
```

---

## 7. How to Run the Project

Spendly uses pure standard client-side technologies. No Node.js build steps, Webpack, Babel, or database installations are needed.

### Method 1: Direct Double-Click (Simplest)
1. Navigate into the `spendly/` project directory.
2. Double-click `index.html` to open it directly in Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari.

### Method 2: Local Development Server (Recommended)
You can serve the folder using any lightweight local static server:

Using Python 3:
```bash
cd spendly
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

Using VS Code:
- Open the `spendly` folder in Visual Studio Code.
- Right-click `index.html` and select **"Open with Live Server"**.

---

## 8. Explanation of CRUD Operations

CRUD stands for **Create, Read, Update, and Delete**—the fundamental operations of persistent data storage:

1. **CREATE (`addExpense` in `js/expenses.js`):**
   - The user inputs expense details (Title, Amount, Category, Date, Payment Method, Description).
   - On submission, `e.preventDefault()` stops browser page reload.
   - A unique identifier is generated (`'exp_' + Date.now()`).
   - A new JavaScript object is created and prepended to the `expenses` array via `expenses.unshift(newExpense)`.
   - The updated array is saved to `LocalStorage` via `saveExpenses(expenses)` and the DOM is refreshed via `render()`.

2. **READ (`renderTransactions` in `js/expenses.js` & `renderDashboard` in `js/dashboard.js`):**
   - On initialization, `loadExpenses()` reads data from `LocalStorage`.
   - The data is transformed into HTML table rows and metric cards using `map()` and template literals.
   - Real-time summaries (Total, Monthly Spend, Category Totals) are derived dynamically.

3. **UPDATE (`editExpense` & `updateExpenseRecord` in `js/expenses.js`):**
   - Clicking the Edit button reads the target ID via event delegation.
   - `expenses.find(exp => exp.id === id)` retrieves the record.
   - Form fields are populated with existing values, and the form shifts to "Edit Mode".
   - Submitting the updated form locates the object via `expenses.findIndex()`, updates its properties, writes back to `LocalStorage`, and re-renders the views.

4. **DELETE (`deleteExpense` & `undoDelete` in `js/expenses.js`):**
   - Clicking Delete opens an accessible confirmation modal.
   - Once confirmed, `expenses = expenses.filter(exp => exp.id !== id)` removes the element.
   - The deleted item and its index are cached in `lastDeletedExpense`.
   - A toast notification with an interactive **Undo** button appears for 6 seconds; clicking Undo uses `expenses.splice()` to restore the item at its original index.

---

## 9. Explanation of LocalStorage

`LocalStorage` is a synchronous key-value Web Storage mechanism provided by modern browsers that allows web applications to store up to approximately 5MB of persistent data per origin.

- **Persistence:** Unlike `SessionStorage` (which clears when a tab closes), data saved in `LocalStorage` remains available even after closing the browser or restarting the computer.
- **String Storage Rule:** `LocalStorage` can only store strings. Complex JavaScript data types like arrays and objects must be serialized into a string format before storage and deserialized back into objects upon retrieval.

Key Spendly storage functions in `js/storage.js`:
- `localStorage.setItem(key, value)`: Writes data.
- `localStorage.getItem(key)`: Reads data.
- `localStorage.removeItem(key)`: Deletes a specific key.

---

## 10. Explanation of JSON.stringify() and JSON.parse()

Because `LocalStorage` only accepts strings:

1. **`JSON.stringify(expenses)`:**
   - Serializes a JavaScript Array of Objects into a standard JSON-formatted string.
   ```javascript
   const expensesArray = [{ title: 'Lunch', amount: 120 }];
   const jsonString = JSON.stringify(expensesArray);
   // Result: '[{"title":"Lunch","amount":120}]'
   localStorage.setItem('spendly_expenses_data', jsonString);
   ```

2. **`JSON.parse(savedData)`:**
   - Deserializes the JSON string back into an executable JavaScript Array of Objects.
   ```javascript
   const savedString = localStorage.getItem('spendly_expenses_data');
   const expensesArray = JSON.parse(savedString);
   // Result: [{ title: 'Lunch', amount: 120 }] (ready for array methods)
   ```

---

## 11. Explanation of JavaScript Array Methods

Spendly heavily utilizes functional ES6 array methods across its architecture:

### 1. `map()`
Transforms every element of an array and returns a new array of the same length without mutating the original.
- **Usage in Spendly:** Renders transaction table rows (`sorted.map(exp => <tr>...</tr>).join('')`) and generates CSV rows.

### 2. `filter()`
Returns a new array containing only elements that satisfy a truthy test condition.
- **Usage in Spendly:** Filters transactions by category (`exp.category === selectedCategory`), month, search keywords, and deletes records by ID (`exp.id !== targetId`).

### 3. `reduce()`
Executes a reducer function on each element to accumulate a single resulting value.
- **Usage in Spendly:** Calculates total spending, monthly expenses, and tallies category totals:
```javascript
const totalSpend = expenses.reduce((sum, item) => sum + item.amount, 0);
```

### 4. `sort()`
Sorts elements in place according to a comparator function.
- **Usage in Spendly:** Sorts transactions by newest date (`new Date(b.date) - new Date(a.date)`) or amount (`b.amount - a.amount`).

### 5. `find()` and `findIndex()`
Returns the first element (or its index) that matches the provided callback condition.
- **Usage in Spendly:** Finds a specific expense record by ID when editing or deleting.

---

## 12. Screenshots & UI Demonstration

*Note: Visual interfaces rendered in modern browsers.*

1. **Dashboard View:**
   - Summary cards displaying Total Expenses, This Month's Spend, Remaining Budget, and Total Transactions.
   - Monthly budget utilization progress bar with threshold alert.
   - Category-wise horizontal distribution preview and recent transactions list.

2. **Transactions View:**
   - Real-time search by keyword.
   - Dropdown filters for Category and Month.
   - Sorting by date and amount.
   - Action buttons (Edit & Delete) with instant Undo notification.

3. **Analytics View:**
   - Horizontal CSS bar charts for all 7 standard expense categories.
   - Payment method breakdown (UPI, Cash, Cards).
   - Smart automated financial insights.

4. **Budget Management:**
   - Visual progress bar comparing monthly spending against a user-configurable limit.
   - Overspending warning banners.

5. **Forest Dark Mode:**
   - Accessible, high-contrast dark theme preserving the nature-inspired sage aesthetic.

---

## 13. Future Improvements

1. **Recurring Subscriptions:** Automatic recurring expense reminders for hostel rent, mobile recharge, and streaming platforms.
2. **Receipt Image Attachment:** Storing compressed receipt images using IndexedDB.
3. **Multi-Currency Support:** Allowing exchange rate conversion for international student exchanges.
4. **Data Visualization Export:** Generating downloadable PDF financial summaries for semester expense auditing.
5. **Split Bill Calculator:** Built-in calculator to split mess, flat, or trip expenses among friends.

---

## 14. Academic Integrity & Course Information

- **Course:** Web Technology (CS204 / WT-CSE)
- **Assignment:** Assignment 4 – Interactive Client-Side Web Application
- **Marks:** 15 Marks
- **Author:** Second-Year BTech Computer Science & Engineering Student
- **Frameworks Used:** None (100% Pure HTML5, CSS3, Vanilla JavaScript)

