export const filterExpenses = (expenses, filters) => {
  return expenses.filter(expense => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchTitle = expense.title.toLowerCase().includes(q);
      const matchDesc = expense.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    
    if (filters.category && filters.category !== "all") {
      if (expense.category !== filters.category) return false;
    }

    if (filters.startDate) {
      const expD = new Date(expense.expense_date);
      const sD = new Date(filters.startDate);
      sD.setHours(0,0,0,0);
      if (expD < sD) return false;
    }
    if (filters.endDate) {
      const expD = new Date(expense.expense_date);
      const eD = new Date(filters.endDate);
      eD.setHours(23,59,59,999);
      if (expD > eD) return false;
    }

    if (filters.month) {
      const expMonth = new Date(expense.expense_date).getMonth() + 1; // 1-12
      if (expMonth.toString() !== filters.month.toString()) return false;
    }
    if (filters.year) {
      const expYear = new Date(expense.expense_date).getFullYear();
      if (expYear.toString() !== filters.year.toString()) return false;
    }

    return true;
  });
};

export const sortExpenses = (expenses, sortField, sortOrder) => {
  return [...expenses].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === "amount") {
      valA = Number(valA);
      valB = Number(valB);
    } else if (sortField === "expense_date" || sortField === "created_at") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    } else {
      valA = valA?.toString().toLowerCase() || "";
      valB = valB?.toString().toLowerCase() || "";
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
};

export const formatINR = (value) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
};

export const CATEGORIES = [
  "Education Loan",
  "EMI",
  "Household",
  "Grocery",
  "Shopping",
  "Food",
  "Transport",
  "Bills",
  "Medical",
  "Entertainment",
  "Miscellaneous"
];
