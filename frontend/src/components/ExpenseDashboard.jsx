import React from 'react';
import { formatINR } from '../utils/expenseHelpers';

const DashboardCard = ({ title, value, subtitle }) => (
  <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', flex: '1', minWidth: '180px', boxShadow: 'var(--shadow-sm)' }}>
    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      {title}
    </div>
    <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{value}</div>
    {subtitle && <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '500' }}>{subtitle}</div>}
  </div>
);

const ExpenseDashboard = ({ analytics }) => {
  if (!analytics) return null;
  const stats = analytics;

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
      <DashboardCard 
        title={<>💰 Total Expenses</>} 
        value={formatINR(stats.total_expenses)} 
      />
      <DashboardCard 
        title={<>📅 This Month</>} 
        value={formatINR(stats.this_month)} 
      />
      <DashboardCard 
        title={<>📊 Monthly Average</>} 
        value={formatINR(stats.monthly_average)} 
      />
      <DashboardCard 
        title={<>🏆 Top Spending Category</>} 
        value={stats.top_category} 
      />
      <DashboardCard 
        title={<>🧾 Total Transactions</>} 
        value={stats.transaction_count} 
      />
    </div>
  );
};

export default ExpenseDashboard;
