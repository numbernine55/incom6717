import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { ALL_CATEGORIES, formatCurrency, THAI_MONTHS_SHORT } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Info
} from 'lucide-react';

interface ChartsViewProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
  allTransactions: Transaction[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  transactions,
  selectedMonth,
  allTransactions
}) => {
  const [activeTab, setActiveTab] = useState<'expense-pie' | 'income-pie' | 'daily-bars' | 'trend-6m'>('expense-pie');
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Filter current month transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Total income & expense in month
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>();
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });

    const list = Array.from(map.entries())
      .map(([name, amount]) => {
        const catInfo = ALL_CATEGORIES.find(c => c.name === name);
        const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return {
          name,
          amount,
          percentage,
          icon: catInfo?.icon || 'HelpCircle',
          color: catInfo?.color || 'text-rose-500',
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return list;
  }, [monthTransactions, totalExpense]);

  // Income by category
  const incomeByCategory = useMemo(() => {
    const map = new Map<string, number>();
    monthTransactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });

    const list = Array.from(map.entries())
      .map(([name, amount]) => {
        const catInfo = ALL_CATEGORIES.find(c => c.name === name);
        const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
        return {
          name,
          amount,
          percentage,
          icon: catInfo?.icon || 'Briefcase',
          color: catInfo?.color || 'text-emerald-500',
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return list;
  }, [monthTransactions, totalIncome]);

  // Colors palette for pie charts
  const PIE_COLORS = [
    '#f97316', '#3b82f6', '#ec4899', '#f59e0b', '#6366f1', 
    '#a855f7', '#ef4444', '#14b8a6', '#10b981', '#64748b'
  ];

  // Daily breakdown for the selected month
  const dailyData = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const days: { day: number; dateStr: string; income: number; expense: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayFormatted = String(d).padStart(2, '0');
      const dateStr = `${selectedMonth}-${dayFormatted}`;
      days.push({ day: d, dateStr, income: 0, expense: 0 });
    }

    monthTransactions.forEach(t => {
      const d = parseInt(t.date.split('-')[2], 10);
      if (d >= 1 && d <= daysInMonth) {
        if (t.type === 'income') {
          days[d - 1].income += t.amount;
        } else {
          days[d - 1].expense += t.amount;
        }
      }
    });

    const maxAmount = Math.max(
      ...days.map(d => Math.max(d.income, d.expense)),
      1000
    );

    return { days, maxAmount };
  }, [monthTransactions, selectedMonth]);

  // 6-Month Trend Data
  const sixMonthsTrend = useMemo(() => {
    const [currYearStr, currMonthStr] = selectedMonth.split('-');
    const currYear = parseInt(currYearStr, 10);
    const currMonth = parseInt(currMonthStr, 10);

    const months: { monthKey: string; label: string; income: number; expense: number; net: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      let m = currMonth - i;
      let y = currYear;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const thaiMonthName = THAI_MONTHS_SHORT[m - 1];
      const label = `${thaiMonthName} ${y + 543}`;

      const inMonth = allTransactions.filter(t => t.date.startsWith(key));
      const inc = inMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = inMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      months.push({
        monthKey: key,
        label,
        income: inc,
        expense: exp,
        net: inc - exp
      });
    }

    const maxVal = Math.max(
      ...months.map(m => Math.max(m.income, m.expense)),
      2000
    );

    return { months, maxVal };
  }, [allTransactions, selectedMonth]);

  // Donut chart path builder helper
  const renderDonutSlices = (data: typeof expenseByCategory, total: number) => {
    if (total === 0 || data.length === 0) {
      return (
        <circle cx="100" cy="100" r="70" fill="none" stroke="#e2e8f0" strokeWidth="28" />
      );
    }

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    return data.map((item, index) => {
      const slicePercentage = item.amount / total;
      const strokeDash = slicePercentage * circumference;
      const strokeOffset = circumference - (accumulatedAngle * circumference);
      accumulatedAngle += slicePercentage;

      const color = PIE_COLORS[index % PIE_COLORS.length];
      const isHovered = hoveredSlice === index;

      return (
        <circle
          key={item.name}
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={isHovered ? 34 : 28}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeDashoffset={strokeOffset}
          transform="rotate(-90 100 100)"
          className="transition-all duration-300 cursor-pointer hover:opacity-90"
          onMouseEnter={() => setHoveredSlice(index)}
          onMouseLeave={() => setHoveredSlice(null)}
        />
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8 transition-all">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            กราฟและรายงานวิเคราะห์การเงิน
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            สัดส่วนการใช้จ่าย แนวโน้มรายวัน และเปรียบเทียบย้อนหลัง
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => { setActiveTab('expense-pie'); setHoveredSlice(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'expense-pie'
                ? 'bg-white text-rose-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-4 h-4 text-rose-500" />
            สัดส่วนรายจ่าย
          </button>
          <button
            onClick={() => { setActiveTab('income-pie'); setHoveredSlice(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'income-pie'
                ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-4 h-4 text-emerald-500" />
            สัดส่วนรายรับ
          </button>
          <button
            onClick={() => { setActiveTab('daily-bars'); setHoveredSlice(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'daily-bars'
                ? 'bg-white text-blue-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-500" />
            รายจ่าย-รับรายวัน
          </button>
          <button
            onClick={() => { setActiveTab('trend-6m'); setHoveredSlice(null); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'trend-6m'
                ? 'bg-white text-purple-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-500" />
            แนวโน้ม 6 เดือน
          </button>
        </div>
      </div>

      {/* VIEW 1: Expense Donut Chart */}
      {activeTab === 'expense-pie' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {renderDonutSlices(expenseByCategory, totalExpense)}
              </svg>
              {/* Inner Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">รายจ่ายรวมเดือนนี้</span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                  {formatCurrency(totalExpense)}
                </span>
                <span className="text-xs text-rose-500 font-medium mt-0.5">
                  {expenseByCategory.length} หมวดหมู่
                </span>
              </div>
            </div>

            {hoveredSlice !== null && expenseByCategory[hoveredSlice] && (
              <div className="mt-4 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-xs">
                <p className="text-xs font-semibold text-slate-600">
                  {expenseByCategory[hoveredSlice].name}
                </p>
                <p className="text-sm font-bold text-rose-600">
                  {formatCurrency(expenseByCategory[hoveredSlice].amount)} ({expenseByCategory[hoveredSlice].percentage.toFixed(1)}%)
                </p>
              </div>
            )}
          </div>

          {/* Category List */}
          <div className="lg:col-span-7">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
              <span>แจกแจงตามหมวดหมู่รายจ่าย</span>
              <span className="text-xs text-slate-400 font-normal">เรียงจากมากไปน้อย</span>
            </h3>

            {expenseByCategory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ยังไม่มีรายการรายจ่ายในเดือนที่เลือก</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {expenseByCategory.map((cat, idx) => {
                  const color = PIE_COLORS[idx % PIE_COLORS.length];
                  const isHovered = hoveredSlice === idx;
                  return (
                    <div
                      key={cat.name}
                      onMouseEnter={() => setHoveredSlice(idx)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isHovered 
                          ? 'bg-rose-50/60 border-rose-300 shadow-xs translate-x-1' 
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-3.5 h-3.5 rounded-full shrink-0" 
                          style={{ backgroundColor: color }}
                        />
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                          <CategoryIcon name={cat.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{cat.name}</p>
                          <div className="w-24 sm:w-36 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${cat.percentage}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-800">{formatCurrency(cat.amount)}</p>
                        <p className="text-xs font-semibold text-slate-500">{cat.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: Income Donut Chart */}
      {activeTab === 'income-pie' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {renderDonutSlices(incomeByCategory, totalIncome)}
              </svg>
              {/* Inner Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">รายรับรวมเดือนนี้</span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                  {formatCurrency(totalIncome)}
                </span>
                <span className="text-xs text-emerald-600 font-medium mt-0.5">
                  {incomeByCategory.length} แหล่งรายรับ
                </span>
              </div>
            </div>

            {hoveredSlice !== null && incomeByCategory[hoveredSlice] && (
              <div className="mt-4 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-xs">
                <p className="text-xs font-semibold text-slate-600">
                  {incomeByCategory[hoveredSlice].name}
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  {formatCurrency(incomeByCategory[hoveredSlice].amount)} ({incomeByCategory[hoveredSlice].percentage.toFixed(1)}%)
                </p>
              </div>
            )}
          </div>

          {/* Category List */}
          <div className="lg:col-span-7">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
              <span>แจกแจงตามหมวดหมู่รายรับ</span>
              <span className="text-xs text-slate-400 font-normal">เรียงจากมากไปน้อย</span>
            </h3>

            {incomeByCategory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ยังไม่มีรายการรายรับในเดือนที่เลือก</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {incomeByCategory.map((cat, idx) => {
                  const color = PIE_COLORS[idx % PIE_COLORS.length];
                  const isHovered = hoveredSlice === idx;
                  return (
                    <div
                      key={cat.name}
                      onMouseEnter={() => setHoveredSlice(idx)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isHovered 
                          ? 'bg-emerald-50/60 border-emerald-300 shadow-xs translate-x-1' 
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-3.5 h-3.5 rounded-full shrink-0" 
                          style={{ backgroundColor: color }}
                        />
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                          <CategoryIcon name={cat.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{cat.name}</p>
                          <div className="w-24 sm:w-36 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${cat.percentage}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-800">{formatCurrency(cat.amount)}</p>
                        <p className="text-xs font-semibold text-emerald-600">{cat.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: Daily Bars Chart */}
      {activeTab === 'daily-bars' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-700">
              ความเคลื่อนไหวรายรับและรายจ่ายประจำวัน (ตลอดทั้งเดือน)
            </span>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" /> รายรับ
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" /> รายจ่าย
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[700px] h-64 flex items-end gap-1.5 pt-8 pb-6 border-b border-slate-200">
              {dailyData.days.map((item) => {
                const incomeHeight = item.income > 0 
                  ? Math.max(6, (item.income / dailyData.maxAmount) * 160)
                  : 0;
                const expenseHeight = item.expense > 0 
                  ? Math.max(6, (item.expense / dailyData.maxAmount) * 160)
                  : 0;
                const hasActivity = item.income > 0 || item.expense > 0;

                return (
                  <div 
                    key={item.day}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip on hover */}
                    {hasActivity && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 z-20 pointer-events-none bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-lg whitespace-nowrap -translate-x-1/2 left-1/2">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1">
                          วันที่ {item.day}
                        </p>
                        {item.income > 0 && (
                          <p className="text-emerald-400">รับ: +{formatCurrency(item.income)}</p>
                        )}
                        {item.expense > 0 && (
                          <p className="text-rose-400">จ่าย: -{formatCurrency(item.expense)}</p>
                        )}
                        <p className="text-slate-300 text-[10px] mt-0.5 pt-0.5 border-t border-slate-800">
                          สุทธิ: {formatCurrency(item.income - item.expense)}
                        </p>
                      </div>
                    )}

                    {/* Bars pair */}
                    <div className="w-full flex items-end justify-center gap-0.5">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${incomeHeight}px` }}
                        className={`w-2 sm:w-2.5 rounded-t-xs transition-all duration-300 ${
                          item.income > 0 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-transparent'
                        }`}
                      />
                      {/* Expense Bar */}
                      <div
                        style={{ height: `${expenseHeight}px` }}
                        className={`w-2 sm:w-2.5 rounded-t-xs transition-all duration-300 ${
                          item.expense > 0 ? 'bg-rose-500 hover:bg-rose-600' : 'bg-transparent'
                        }`}
                      />
                    </div>

                    {/* Date label */}
                    <span className="text-[10px] text-slate-400 mt-2 font-mono group-hover:text-slate-700">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-slate-400 text-right mt-2">
            * เลื่อนเมาส์ชี้ที่แท่งกราฟเพื่อดูรายละเอียดรายวัน
          </p>
        </div>
      )}

      {/* VIEW 4: 6-Month Trend */}
      {activeTab === 'trend-6m' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-700">
              เปรียบเทียบประวัติการเงิน 6 เดือนย้อนหลัง
            </span>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" /> รายรับ
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-rose-500" /> รายจ่าย
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-indigo-500" /> เงินคงเหลือสุทธิ
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
            {sixMonthsTrend.months.map((m) => {
              const isSelected = m.monthKey === selectedMonth;
              return (
                <div
                  key={m.monthKey}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-slate-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-500 mb-2">{m.label}</p>
                  
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">รายรับ:</span>
                      <span className="font-semibold text-emerald-600">+{formatCurrency(m.income)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">รายจ่าย:</span>
                      <span className="font-semibold text-rose-600">-{formatCurrency(m.expense)}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between font-bold">
                      <span className="text-slate-600">คงเหลือ:</span>
                      <span className={m.net >= 0 ? 'text-indigo-600' : 'text-rose-600'}>
                        {m.net >= 0 ? '+' : ''}{formatCurrency(m.net)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
