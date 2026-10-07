import React from 'react';
import { User } from 'firebase/auth';
import { 
  Wallet, 
  Database, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Plus, 
  LogIn, 
  LogOut, 
  User as UserIcon,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { formatMonthName, getCurrentYearMonth } from '../constants/categories';

interface HeaderProps {
  user: User | null;
  firebaseProjectId: string;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onLogin: () => void;
  onLogout: () => void;
  onOpenAddModal: () => void;
  onSeedData: () => void;
  isFirebaseConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  firebaseProjectId,
  selectedMonth,
  onSelectMonth,
  onLogin,
  onLogout,
  onOpenAddModal,
  onSeedData,
  isFirebaseConnected,
}) => {
  // Navigate months
  const handlePrevMonth = () => {
    const [yStr, mStr] = selectedMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) - 1;
    if (m <= 0) {
      m = 12;
      y -= 1;
    }
    onSelectMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yStr, mStr] = selectedMonth.split('-');
    let y = parseInt(yStr, 10);
    let m = parseInt(mStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    onSelectMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    onSelectMonth(getCurrentYearMonth());
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Firebase Status */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs font-mono flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Firebase Firestore:</span>
          <span className="text-white font-semibold">{firebaseProjectId}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-slate-300">{isFirebaseConnected ? 'เชื่อมต่อเรียลไทม์' : 'กำลังเชื่อมต่อ'}</span>
          </div>
          {user && (
            <button
              onClick={onSeedData}
              className="text-[11px] text-amber-300 hover:text-amber-200 underline cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> ข้อมูลตัวอย่าง
            </button>
          )}
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
                Smart Expense Tracker
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                ระบบจัดการรายรับรายจ่าย & สรุปผลการเงิน
              </p>
            </div>
          </div>

          {/* Mobile Quick Add */}
          <button
            onClick={onOpenAddModal}
            className="md:hidden w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selector Control */}
        <div className="flex items-center justify-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 sm:px-4 py-1 text-center min-w-[140px] sm:min-w-[170px]">
            <span className="text-xs font-semibold text-slate-700 block">
              {formatMonthName(selectedMonth)}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedMonth !== getCurrentYearMonth() && (
            <button
              onClick={handleCurrentMonth}
              className="ml-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              เดือนนี้
            </button>
          )}
        </div>

        {/* Actions & User Authentication */}
        <div className="flex items-center justify-end gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl py-1 px-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-slate-300"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden sm:block text-left text-xs max-w-[130px] truncate">
                  <p className="font-semibold text-slate-800 truncate">{user.displayName || 'ผู้ใช้'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={onOpenAddModal}
                className="hidden md:flex px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>บันทึก</span>
              </button>

              <button
                onClick={onLogout}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
