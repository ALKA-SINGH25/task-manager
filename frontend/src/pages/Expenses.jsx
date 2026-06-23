import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import useExpenses from "../hooks/useExpenses";
import ExpenseDashboard from "../components/ExpenseDashboard";
import ExpenseAnalytics from "../components/ExpenseAnalytics";
import ExpenseList from "../components/ExpenseList";
import ExpenseFilters from "../components/ExpenseFilters";
import ExpenseModal from "../components/ExpenseModal";

const EMPTY_FORM = { title: "", amount: "", category: "", description: "", expense_date: new Date().toISOString().split('T')[0] };

const Expenses = () => {
  const { showToast } = useToast();
  const { expenses, analytics, loading, createExpense, updateExpense, deleteExpense, fetchExpenses, fetchAnalytics } = useExpenses(showToast);
  
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [validationError, setValidationError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    month: "",
    year: "",
    sortField: "expense_date",
    sortOrder: "desc"
  });

  useEffect(() => {
    fetchExpenses(filters);
    fetchAnalytics();
  }, [filters, fetchExpenses, fetchAnalytics]);

  const refreshData = () => {
    fetchExpenses(filters);
    fetchAnalytics();
  };

  const handleNewExpense = () => {
    setEditExpense(null);
    setForm({ ...EMPTY_FORM, expense_date: new Date().toISOString().split('T')[0] });
    setValidationError(null);
    setShowForm(true);
  };

  const handleEdit = (exp) => {
    setEditExpense(exp);
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      description: exp.description || "",
      expense_date: exp.expense_date ? exp.expense_date.split('T')[0] : "",
    });
    setValidationError(null);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditExpense(null);
    setForm(EMPTY_FORM);
    setValidationError(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.amount || !form.category || !form.expense_date) {
      setValidationError("Please fill all required fields");
      return;
    }
    if (Number(form.amount) <= 0) {
      setValidationError("Amount must be greater than 0");
      return;
    }

    const payload = {
        ...form,
        amount: Number(form.amount)
    };

    const result = editExpense
      ? await updateExpense(editExpense._id, payload)
      : await createExpense(payload);

    if (result.success) {
      refreshData();
      handleClose();
    }
  };

  const handleDelete = async (id) => {
    const res = await deleteExpense(id);
    if (res.success) {
      refreshData();
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Expense Tracker</h1>
        <button className="btn-add" onClick={handleNewExpense}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Expense
        </button>
      </div>

      <ExpenseDashboard analytics={analytics} />
      <ExpenseAnalytics analytics={analytics} />
      <ExpenseFilters filters={filters} onFilterChange={setFilters} />
      
      {loading ? (
        <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>Loading expenses...</div>
      ) : (
        <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {showForm && (
        <ExpenseModal
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={handleClose}
          editExpense={editExpense}
          validationError={validationError}
          setValidationError={setValidationError}
        />
      )}
    </>
  );
};

export default Expenses;
