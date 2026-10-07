import React from 'react';
import { formatCurrency, formatNumber } from '../constants/categories';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  PiggyBank, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface MetricCardsProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  dailyAvgExpense: number;
  daysPassedInMonth: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalIncome,
  totalExpense,
  netBalance,
  savingsRate,
  dailyAvgExpense,
  daysPassedInMonth
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Income */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายรับรวม (Income)
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-slate-800 tracking-tight">
            +{formatCurrency(totalIncome)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>กระแสเงินสดขาเข้า</span>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 pointer-events-none">
          <ArrowUpRight className="w-24 h-24 text-emerald-800" />
        </div>
      </div>

      {/* 2. Total Expense */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายจ่ายรวม (Expense)
          </span>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/80">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-slate-800 tracking-tight">
            -{formatCurrency(totalExpense)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>เฉลี่ยวันละ {formatCurrency(dailyAvgExpense)}</span>
            <span className="text-slate-300">({daysPassedInMonth} วัน)</span>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 pointer-events-none">
          <ArrowDownRight className="w-24 h-24 text-rose-800" />
        </div>
      </div>

      {/* 3. Net Balance */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            คงเหลือสุทธิ (Net Balance)
          </span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            netBalance >= 0 
              ? 'bg-blue-50 text-blue-600 border-blue-100/80' 
              : 'bg-rose-50 text-rose-600 border-rose-100/80'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className={`text-2xl font-bold tracking-tight ${
            netBalance >= 0 ? 'text-blue-700' : 'text-rose-600'
          }`}>
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
          </p>
          <div className="flex items-center gap-1.5 text-xs font-medium">
            {netBalance >= 0 ? (
              <span className="text-blue-600">สถานะการเงินปกติ</span>
            ) : (
              <span className="text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> รายจ่ายเกินรายรับ!
              </span>
            )}
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 pointer-events-none">
          <Wallet className="w-24 h-24 text-blue-800" />
        </div>
      </div>

      {/* 4. Savings Rate */}
      <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            อัตราการออมเงิน (Savings Rate)
          </span>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/80">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-slate-800 tracking-tight">
            {totalIncome > 0 ? `${savingsRate.toFixed(1)}%` : '0%'}
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                savingsRate >= 20 
                  ? 'bg-emerald-500' 
                  : savingsRate > 0 
                  ? 'bg-amber-500' 
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 pointer-events-none">
          <PiggyBank className="w-24 h-24 text-amber-800" />
        </div>
      </div>
    </div>
  );
};
