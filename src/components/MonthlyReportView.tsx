import React from 'react';
import { Transaction } from '../types';
import { 
  formatCurrency, 
  formatMonthName, 
  ALL_CATEGORIES, 
  PAYMENT_METHODS, 
  formatThaiDate 
} from '../constants/categories';
import { 
  FileSpreadsheet, 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Sparkles,
  Calendar,
  CheckCircle,
  FileCheck
} from 'lucide-react';

interface MonthlyReportViewProps {
  transactions: Transaction[];
  selectedMonth: string;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  transactions,
  selectedMonth
}) => {
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  const incomeTx = monthTransactions.filter(t => t.type === 'income');
  const expenseTx = monthTransactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTx.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netBalance) / totalIncome) * 100 : 0;

  // Category breakdowns
  const getBreakdown = (list: Transaction[], total: number) => {
    const map = new Map<string, { count: number; amount: number }>();
    list.forEach(t => {
      const cur = map.get(t.category) || { count: 0, amount: 0 };
      map.set(t.category, { count: cur.count + 1, amount: cur.amount + t.amount });
    });

    return Array.from(map.entries())
      .map(([category, val]) => ({
        category,
        count: val.count,
        amount: val.amount,
        percentage: total > 0 ? (val.amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const expenseBreakdown = getBreakdown(expenseTx, totalExpense);
  const incomeBreakdown = getBreakdown(incomeTx, totalIncome);

  // Export to CSV with UTF-8 BOM for Thai support
  const handleExportCSV = () => {
    if (monthTransactions.length === 0) {
      alert('ไม่มีรายการในเดือนนี้ให้ดาวน์โหลด');
      return;
    }

    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'ช่องทางชำระ', 'บันทึกช่วยจำ'];
    const rows = monthTransactions.map(t => {
      const typeLabel = t.type === 'income' ? 'รายรับ' : 'รายจ่าย';
      const paymentInfo = PAYMENT_METHODS.find(p => p.id === t.paymentMethod);
      return [
        `"${t.date}"`,
        `"${typeLabel}"`,
        `"${t.category}"`,
        `"${t.amount}"`,
        `"${paymentInfo?.name || t.paymentMethod || ''}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `statement-smart-tracker-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-8 print:p-0 print:border-none print:shadow-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-emerald-600" />
            <span>ใบสรุปผลรายงานทางการเงินประจำเดือน</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            รอบบิลประจำเดือน {formatMonthName(selectedMonth)}
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออก CSV (Excel)</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ / PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
        <div>
          <span className="text-xs font-medium text-slate-500">รายรับทั้งหมด</span>
          <p className="text-lg font-bold text-emerald-600 mt-1">+{formatCurrency(totalIncome)}</p>
          <span className="text-[11px] text-slate-400">{incomeTx.length} รายการ</span>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500">รายจ่ายทั้งหมด</span>
          <p className="text-lg font-bold text-rose-600 mt-1">-{formatCurrency(totalExpense)}</p>
          <span className="text-[11px] text-slate-400">{expenseTx.length} รายการ</span>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500">เงินคงเหลือสุทธิ</span>
          <p className={`text-lg font-bold mt-1 ${netBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
          </p>
          <span className="text-[11px] text-slate-400">
            {netBalance >= 0 ? 'สถานะเกินดุล' : 'สถานะขาดดุล'}
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500">อัตราการออม</span>
          <p className="text-lg font-bold text-slate-800 mt-1">
            {totalIncome > 0 ? `${savingsRate.toFixed(1)}%` : '0%'}
          </p>
          <span className="text-[11px] text-slate-400">ของรายรับรวม</span>
        </div>
      </div>

      {/* Tables Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense breakdown table */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5 text-rose-600">
            <ArrowDownRight className="w-4 h-4" /> สรุปรายจ่ายแยกตามหมวดหมู่
          </h3>
          {expenseBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">ไม่มีรายการรายจ่ายในเดือนนี้</p>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">หมวดหมู่</th>
                    <th className="py-2.5 px-2 text-center">จำนวน</th>
                    <th className="py-2.5 px-3 text-right">ยอดรวม</th>
                    <th className="py-2.5 px-3 text-right">สัดส่วน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenseBreakdown.map(item => (
                    <tr key={item.category} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.category}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{item.count}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-rose-600">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {item.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Income breakdown table */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5 text-emerald-600">
            <ArrowUpRight className="w-4 h-4" /> สรุปรายรับแยกตามหมวดหมู่
          </h3>
          {incomeBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">ไม่มีรายการรายรับในเดือนนี้</p>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">หมวดหมู่</th>
                    <th className="py-2.5 px-2 text-center">จำนวน</th>
                    <th className="py-2.5 px-3 text-right">ยอดรวม</th>
                    <th className="py-2.5 px-3 text-right">สัดส่วน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomeBreakdown.map(item => (
                    <tr key={item.category} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">{item.category}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{item.count}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {item.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
