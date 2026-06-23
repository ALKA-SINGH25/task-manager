import { CATEGORIES } from "../utils/expenseHelpers";

const ExpenseModal = ({
  form,
  setForm,
  onSubmit,
  onClose,
  editExpense,
  validationError,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>{editExpense ? "Edit Expense" : "New Expense"}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <label className="field-label" htmlFor="exp-title">Title</label>
        <input
          id="exp-title"
          className="input"
          placeholder="What was this expense for?"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
        />

        <label className="field-label" htmlFor="exp-amount">Amount (₹)</label>
        <input
          id="exp-amount"
          className="input"
          type="number"
          step="0.01"
          min="0"
          placeholder="0"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <label className="field-label" htmlFor="exp-category">Category</label>
        <select
          id="exp-category"
          className="input"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="" disabled>Select a category...</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="field-label" htmlFor="exp-date">Date</label>
        <input
          id="exp-date"
          className="input"
          type="date"
          value={form.expense_date}
          onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
        />

        <label className="field-label" htmlFor="exp-desc">Description</label>
        <textarea
          id="exp-desc"
          className="input textarea"
          placeholder="Add description (optional)..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {validationError && (
          <div className="modal-error">{validationError}</div>
        )}

        <div className="modal-footer" style={{ marginTop: '20px' }}>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="btn-submit"
            onClick={onSubmit}
            disabled={Boolean(validationError)}
          >
            {editExpense ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;
