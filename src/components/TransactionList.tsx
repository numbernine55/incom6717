import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { 
  ALL_CATEGORIES, 
  PAYMENT_METHODS, 
  formatCurrency, 
  formatThaiDate 
} from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  Edit3, 
  Plus, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  CreditCard,
  FileText,
  ChevronDown
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenAddModal: () => void;
  selectedMonth: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
  selectedMonth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Month match
      if (!t.date.startsWith(selectedMonth)) return false;

      // Type match
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Category match
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Payment method match
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNote = t.note?.toLowerCase().includes(query);
        const matchCategory = t.category.toLowerCase().includes(query);
        const matchAmount = String(t.amount).includes(query);
        if (!matchNote && !matchCategory && !matchAmount) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, selectedMonth, typeFilter, categoryFilter, paymentFilter, searchTerm, sortBy]);

  const handleDeleteClick = async (id?: string) => {
    if (!id) return;
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Group transactions by date for a clean feed look
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    filteredTransactions.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    if (sortBy === 'date-asc') return a.localeCompare(b);
    return b.localeCompare(a);
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-8">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>รายการรายรับ-รายจ่าย</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filteredTransactions.length} รายการ
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            ประวัติการบันทึกรายการ ค้นหา และจัดการ
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มรายการใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 mb-6 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหารายการ (หมวดหมู่, บันทึกช่วยจำ, จำนวนเงิน)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold shrink-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'expense' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
          </div>
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">หมวดหมู่:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {ALL_CATEGORIES.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">การชำระ:</span>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">ทุกช่องทาง</option>
              {PAYMENT_METHODS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="date-desc">วันที่ (ใหม่สุดไปเก่าสุด)</option>
              <option value="date-asc">วันที่ (เก่าสุดไปใหม่สุด)</option>
              <option value="amount-desc">จำนวนเงิน (มากไปน้อย)</option>
              <option value="amount-asc">จำนวนเงิน (น้อยไปมาก)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-700">ไม่พบรายการรายรับ-รายจ่าย</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            ลองปรับเปลี่ยนตัวกรอง ค้นหาคำอื่น หรือคลิกปุ่มด้านล่างเพื่อเพิ่มรายการแรกของคุณ
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
          >
            + บันทึกรายการใหม่
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(dateKey => {
            const dateTxList = groupedByDate[dateKey];
            const dateTotalIncome = dateTxList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const dateTotalExpense = dateTxList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

            return (
              <div key={dateKey} className="space-y-2">
                {/* Date Group Header */}
                <div className="flex items-center justify-between text-xs font-semibold px-2 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatThaiDate(dateKey)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    {dateTotalIncome > 0 && (
                      <span className="text-emerald-600 font-medium">
                        +{formatCurrency(dateTotalIncome)}
                      </span>
                    )}
                    {dateTotalExpense > 0 && (
                      <span className="text-rose-600 font-medium">
                        -{formatCurrency(dateTotalExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items in date */}
                <div className="space-y-2">
                  {dateTxList.map(tx => {
                    const catInfo = ALL_CATEGORIES.find(c => c.name === tx.category);
                    const paymentInfo = PAYMENT_METHODS.find(p => p.id === tx.paymentMethod);
                    const isIncome = tx.type === 'income';

                    return (
                      <div
                        key={tx.id || Math.random().toString()}
                        className="group p-3.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-xs transition-all bg-white flex items-center justify-between gap-4"
                      >
                        {/* Left: Icon & Description */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            <CategoryIcon name={catInfo?.icon || (isIncome ? 'Briefcase' : 'ShoppingBag')} className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800 truncate">
                                {tx.category}
                              </span>
                              {tx.paymentMethod && (
                                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  <CreditCard className="w-3 h-3 text-slate-400" />
                                  {paymentInfo?.name || tx.paymentMethod}
                                </span>
                              )}
                            </div>
                            {tx.note ? (
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {tx.note}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400 mt-0.5">
                                ไม่ได้ระบุบันทึก
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className={`text-base font-extrabold tracking-tight ${
                              isIncome ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {tx.date}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEdit(tx)}
                              title="แก้ไขรายการ"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(tx.id)}
                              disabled={deletingId === tx.id}
                              title="ลบรายการ"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
