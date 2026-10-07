import React, { useState } from 'react';
import { Budget, Transaction } from '../types';
import { EXPENSE_CATEGORIES, formatCurrency } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { 
  Target, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  X,
  Edit2
} from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
  selectedMonth: string;
  onSaveBudget: (category: string, amount: number) => Promise<void>;
  onDeleteBudget: (budgetId: string) => Promise<void>;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  transactions,
  selectedMonth,
  onSaveBudget,
  onDeleteBudget
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(EXPENSE_CATEGORIES[0].name);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Month expenses
  const monthExpenses = transactions.filter(
    t => t.type === 'expense' && t.date.startsWith(selectedMonth)
  );

  // Calculate total budgeted vs total spent on budgeted categories
  const budgetStats = budgets.map(b => {
    const spent = monthExpenses
      .filter(t => t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    const remaining = b.amount - spent;
    const catInfo = EXPENSE_CATEGORIES.find(c => c.name === b.category);

    return {
      ...b,
      spent,
      percent,
      remaining,
      catInfo
    };
  });

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpentInBudgeted = budgetStats.reduce((sum, b) => sum + b.spent, 0);

  const handleOpenAdd = (defaultCategory?: string, currentAmount?: number) => {
    if (defaultCategory) setSelectedCategory(defaultCategory);
    if (currentAmount) setBudgetAmount(String(currentAmount));
    else setBudgetAmount('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(budgetAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    try {
      setIsSaving(true);
      await onSaveBudget(selectedCategory, parsed);
      setIsModalOpen(false);
      setBudgetAmount('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            <span>วางแผนและคุมงบประมาณ (Monthly Budget)</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            กำหนดเพดานค่าใช้จ่ายรายหมวดหมู่ ป้องกันใช้จ่ายเกินตัว
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ตั้งงบประมาณหมวดหมู่</span>
        </button>
      </div>

      {/* Summary Box */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
          <div>
            <span className="text-xs text-indigo-600 font-semibold uppercase">งบประมาณรวมที่ตั้งไว้</span>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{formatCurrency(totalBudgeted)}</p>
          </div>
          <div>
            <span className="text-xs text-indigo-600 font-semibold uppercase">ใช้ไปแล้ว</span>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{formatCurrency(totalSpentInBudgeted)}</p>
          </div>
          <div>
            <span className="text-xs text-indigo-600 font-semibold uppercase">คงเหลืองบประมาณ</span>
            <p className={`text-xl font-bold mt-0.5 ${
              totalBudgeted >= totalSpentInBudgeted ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {formatCurrency(totalBudgeted - totalSpentInBudgeted)}
            </p>
          </div>
        </div>
      )}

      {/* Budget List */}
      {budgetStats.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Target className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
          <p className="text-sm font-semibold text-slate-600">ยังไม่ได้ตั้งงบประมาณสำหรับเดือนนี้</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-3">
            การตั้งงบประมาณช่วยให้คุณวางแผนเป้าหมายทางการเงินและจำกัดค่าใช้จ่ายได้ดียิ่งขึ้น
          </p>
          <button
            onClick={() => handleOpenAdd()}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs"
          >
            + เริ่มตั้งงบประมาณรายการแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetStats.map((item) => {
            const isOver = item.percent > 100;
            const isNear = item.percent >= 80 && !isOver;

            return (
              <div
                key={item.id || item.category}
                className={`p-4 rounded-xl border transition-all ${
                  isOver 
                    ? 'bg-rose-50/40 border-rose-200' 
                    : isNear 
                    ? 'bg-amber-50/40 border-amber-200' 
                    : 'bg-white border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <CategoryIcon name={item.catInfo?.icon || 'Receipt'} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.category}</h4>
                      <p className="text-xs text-slate-500">
                        งบ {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isOver ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700">
                        <AlertTriangle className="w-3 h-3" /> เกินงบ {item.percent.toFixed(0)}%
                      </span>
                    ) : isNear ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-700">
                        ใกล้เต็ม {item.percent.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> ปกติ {item.percent.toFixed(0)}%
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenAdd(item.category, item.amount)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                      title="แก้ไขงบ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {item.id && (
                      <button
                        onClick={() => onDeleteBudget(item.id!)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                        title="ลบงบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden my-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, item.percent)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>จ่ายไปแล้ว {formatCurrency(item.spent)}</span>
                  <span className={`font-semibold ${isOver ? 'text-rose-600' : 'text-slate-700'}`}>
                    {isOver ? `เกินไป ${formatCurrency(Math.abs(item.remaining))}` : `เหลือ ${formatCurrency(item.remaining)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Set Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                ตั้งงบประมาณรายจ่าย
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  เลือกหมวดหมู่รายจ่าย
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  จำนวนเงินงบประมาณ (บาท/เดือน)
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="เช่น 5000"
                  value={budgetAmount}
                  onChange={e => setBudgetAmount(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-bold text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
