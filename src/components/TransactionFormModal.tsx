import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES, 
  PAYMENT_METHODS, 
  getCurrentDateStr 
} from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { 
  X, 
  Check, 
  Calendar, 
  CreditCard, 
  FileText, 
  Coins, 
  Plus, 
  Sparkles,
  Layers
} from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  initialData?: Transaction | null;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(getCurrentDateStr());
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setCategory(initialData.category);
      setDate(initialData.date);
      setNote(initialData.note || '');
      setPaymentMethod(initialData.paymentMethod || 'promptpay');
    } else {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      setDate(getCurrentDateStr());
      setNote('');
      setPaymentMethod('promptpay');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  // If type changes and current category is not in list, pick default
  useEffect(() => {
    if (initialData) return;
    const catList = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    if (!catList.some(c => c.name === category)) {
      setCategory(catList[0].name);
    }
  }, [type]);

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const quickAmounts = type === 'expense' 
    ? [50, 100, 300, 500, 1000] 
    : [500, 1000, 5000, 15000, 30000];

  const handleQuickAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addVal));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('กรุณากรอกจำนวนเงินที่มากกว่า 0');
      return;
    }

    if (!category) {
      setErrorMsg('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (!date) {
      setErrorMsg('กรุณาระบุวันที่');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave({
        type,
        amount: Math.round(parsedAmount * 100) / 100,
        category,
        date,
        note: note.trim() || undefined,
        paymentMethod,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white ${
              type === 'expense' ? 'bg-rose-500' : 'bg-emerald-500'
            }`}>
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {initialData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {errorMsg}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                className={`w-full pl-12 pr-4 py-3.5 text-2xl font-extrabold rounded-2xl border transition-all focus:outline-hidden ${
                  type === 'expense'
                    ? 'border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-rose-600'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-emerald-600'
                }`}
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> ลัด:
              </span>
              {quickAmounts.map(v => (
                <button
                  type="button"
                  key={v}
                  onClick={() => handleQuickAddAmount(v)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  +{v.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
              {currentCategories.map(cat => {
                const isSelected = category === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? type === 'expense'
                          ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-xs ring-1 ring-rose-400'
                          : 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs ring-1 ring-emerald-400'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? type === 'expense' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> วันที่ทำรายการ *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" /> ช่องทางการชำระ
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-hidden focus:border-slate-400 bg-white"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <input
              type="text"
              placeholder="เช่น ข้าวกลางวัน, ค่าน้ำมัน, ชาไทยปั่น..."
              value={note}
              maxLength={500}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-hidden focus:border-slate-400 placeholder:text-slate-400"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition-all flex items-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 active:scale-95'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{initialData ? 'อัปเดตรายการ' : 'บันทึกรายการ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
