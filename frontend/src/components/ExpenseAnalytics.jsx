import React from 'react';
import { PieChart, BarChart } from '@mui/x-charts';
import { formatINR } from '../utils/expenseHelpers';

const COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#f97316', '#8b5cf6', '#64748b'
];

const ExpenseAnalytics = ({ analytics }) => {
  if (!analytics || analytics.transaction_count === 0) {
    return (
      <div style={{ background: 'var(--bg-panel)', padding: '60px 20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center', marginBottom: '30px', boxShadow: 'var(--shadow-md)' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.6 }}>
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
        <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', color: 'var(--text-primary)', fontWeight: '600' }}>No expenses added yet</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Click 'Add Expense' to start tracking your spending.</p>
      </div>
    );
  }

  const pieData = analytics.category_distribution;
  const barMonths = analytics.monthly_analytics.map(m => m.month);
  const barTotals = analytics.monthly_analytics.map(m => m.amount);

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 400px', background: 'var(--bg-panel)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category Distribution</h3>
        <PieChart
          series={[
            {
              data: pieData,
              innerRadius: 50,
              outerRadius: 110,
              paddingAngle: 3,
              cornerRadius: 5,
              highlightScope: { fade: 'global', highlight: 'item' },
              faded: { innerRadius: 50, additionalRadius: -20, color: 'gray' },
              valueFormatter: (v) => formatINR(v.value),
              arcLabel: (item) => {
                return item.percentage >= 5 ? `${item.percentage}%` : '';
              },
              arcLabelMinAngle: 20
            },
          ]}
          height={320}
          margin={{ top: 10, bottom: 10, left: 10, right: 180 }}
          slotProps={{ 
            legend: { 
              labelStyle: { fill: '#ffffff', fontSize: 12 },
              direction: 'column', 
              position: { vertical: 'middle', horizontal: 'right' },
              itemMarkWidth: 10,
              itemMarkHeight: 10
            } 
          }}
          sx={{
            "& .MuiPieArcLabel-root": {
              fill: "#ffffff",
              fontSize: "14px",
              fontWeight: "600"
            }
          }}
          colors={COLORS}
        />
      </div>

      <div style={{ flex: '2 1 500px', background: 'var(--bg-panel)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly Analytics ({new Date().getFullYear()})</h3>
        <BarChart
          xAxis={[{ scaleType: 'band', data: barMonths, tickLabelStyle: { fill: 'var(--text-secondary)', fontSize: 12 } }]}
          yAxis={[{ tickLabelStyle: { fill: 'var(--text-secondary)', fontSize: 12 }, valueFormatter: (v) => formatINR(v) }]}
          series={[{ data: barTotals, color: 'var(--primary-indigo)', valueFormatter: (v) => formatINR(v) }]}
          height={320}
          margin={{ top: 20, bottom: 30, left: 70, right: 20 }}
          slotProps={{
             popper: {
                 sx: {
                     '& .MuiChartsTooltip-root': {
                         backgroundColor: 'var(--bg-card)',
                         color: 'var(--text-primary)',
                         border: '1px solid var(--border-subtle)'
                     }
                 }
             }
          }}
        />
      </div>
    </div>
  );
};

export default ExpenseAnalytics;
