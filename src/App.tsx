import React, { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  loginWithGoogle, 
  logout, 
  testConnection, 
  firebaseProjectId,
  handleFirestoreError,
  OperationType 
} from './firebase';
import { Transaction, Budget, TransactionType } from './types';
import { 
  getCurrentYearMonth, 
  formatCurrency, 
  formatMonthName, 
  EXPENSE_CATEGORIES 
} from './constants/categories';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { ChartsView } from './components/ChartsView';
import { TransactionList } from './components/TransactionList';
import { BudgetManager } from './components/BudgetManager';
import { MonthlyReportView } from './components/MonthlyReportView';
import { TransactionFormModal } from './components/TransactionFormModal';
import { SeedDataModal } from './components/SeedDataModal';
import { 
  BarChart3, 
  ListFilter, 
  Target, 
  FileText, 
  Wallet, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  LogIn, 
  CheckCircle2, 
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth());
  const [activeTab, setActiveTab] = useState<'charts' | 'transactions' | 'budgets' | 'report'>('charts');

  // Firestore data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Demo fallback state if user tests without login
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoTransactions, setDemoTransactions] = useState<Transaction[]>([]);
  const [demoBudgets, setDemoBudgets] = useState<Budget[]>([]);

  // 1. Connection check & Auth listener
  useEffect(() => {
    testConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setIsDemoMode(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore sync
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      return;
    }

    setDataLoading(true);
    setErrorMessage(null);

    // Transactions listener
    const txCollectionPath = 'transactions';
    const txQuery = query(
      collection(db, txCollectionPath),
      where('userId', '==', user.uid)
    );

    const unsubTx = onSnapshot(
      txQuery,
      (snapshot) => {
        const items: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            userId: data.userId,
            type: data.type,
            amount: data.amount,
            category: data.category,
            date: data.date,
            note: data.note,
            paymentMethod: data.paymentMethod,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt,
          });
        });
        setTransactions(items);
        setDataLoading(false);
      },
      (error) => {
        setDataLoading(false);
        setErrorMessage('เกิดข้อผิดพลาดในการโหลดรายการจาก Firebase');
        handleFirestoreError(error, OperationType.LIST, txCollectionPath);
      }
    );

    // Budgets listener
    const budgetsCollectionPath = 'budgets';
    const budgetsQuery = query(
      collection(db, budgetsCollectionPath),
      where('userId', '==', user.uid)
    );

    const unsubBudgets = onSnapshot(
      budgetsQuery,
      (snapshot) => {
        const items: Budget[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            userId: data.userId,
            month: data.month,
            category: data.category,
            amount: data.amount,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        setBudgets(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, budgetsCollectionPath);
      }
    );

    return () => {
      unsubTx();
      unsubBudgets();
    };
  }, [user]);

  // Current active data (either Firestore user data or demo data)
  const currentTransactions = useMemo(() => {
    if (user) return transactions;
    if (isDemoMode) return demoTransactions;
    return [];
  }, [user, isDemoMode, transactions, demoTransactions]);

  const currentBudgets = useMemo(() => {
    if (user) return budgets.filter(b => b.month === selectedMonth);
    if (isDemoMode) return demoBudgets.filter(b => b.month === selectedMonth);
    return [];
  }, [user, isDemoMode, budgets, demoBudgets, selectedMonth]);

  // Monthly stats calculation
  const monthlyStats = useMemo(() => {
    const monthTx = currentTransactions.filter(t => t.date.startsWith(selectedMonth));
    const totalIncome = monthTx
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTx
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

    // Calculate days passed in month
    const [yearStr, monthStr] = selectedMonth.split('-');
    const now = new Date();
    const isCurrentMonth = 
      now.getFullYear() === parseInt(yearStr, 10) && 
      (now.getMonth() + 1) === parseInt(monthStr, 10);
    const daysPassedInMonth = isCurrentMonth 
      ? now.getDate() 
      : new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();

    const dailyAvgExpense = daysPassedInMonth > 0 ? totalExpense / daysPassedInMonth : 0;

    return {
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      dailyAvgExpense,
      daysPassedInMonth,
    };
  }, [currentTransactions, selectedMonth]);

  // Save (Create or Update) Transaction
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
  ) => {
    if (user) {
      if (editingTransaction && editingTransaction.id) {
        // Update
        const path = `transactions/${editingTransaction.id}`;
        try {
          const docRef = doc(db, 'transactions', editingTransaction.id);
          await updateDoc(docRef, {
            type: data.type,
            amount: data.amount,
            category: data.category,
            date: data.date,
            note: data.note || '',
            paymentMethod: data.paymentMethod || 'cash',
            updatedAt: new Date().toISOString(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        }
      } else {
        // Create
        const path = 'transactions';
        try {
          await addDoc(collection(db, path), {
            userId: user.uid,
            type: data.type,
            amount: data.amount,
            category: data.category,
            date: data.date,
            note: data.note || '',
            paymentMethod: data.paymentMethod || 'cash',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      }
    } else {
      // Demo mode fallback
      if (editingTransaction && editingTransaction.id) {
        setDemoTransactions(prev =>
          prev.map(t =>
            t.id === editingTransaction.id
              ? { ...t, ...data, updatedAt: new Date().toISOString() }
              : t
          )
        );
      } else {
        const newDemoTx: Transaction = {
          id: 'demo_' + Date.now(),
          userId: 'demo_user',
          ...data,
          createdAt: new Date().toISOString(),
        };
        setDemoTransactions(prev => [newDemoTx, ...prev]);
      }
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      const path = `transactions/${id}`;
      try {
        await deleteDoc(doc(db, 'transactions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      setDemoTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Save Category Budget
  const handleSaveBudget = async (category: string, amount: number) => {
    if (user) {
      const path = 'budgets';
      try {
        // Check if budget for category & month already exists
        const existing = budgets.find(
          b => b.month === selectedMonth && b.category === category
        );
        if (existing && existing.id) {
          await updateDoc(doc(db, 'budgets', existing.id), {
            amount,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await addDoc(collection(db, path), {
            userId: user.uid,
            month: selectedMonth,
            category,
            amount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    } else {
      setDemoBudgets(prev => {
        const filtered = prev.filter(
          b => !(b.month === selectedMonth && b.category === category)
        );
        return [
          ...filtered,
          {
            id: 'budget_' + Date.now(),
            userId: 'demo_user',
            month: selectedMonth,
            category,
            amount,
          },
        ];
      });
    }
  };

  // Delete Budget
  const handleDeleteBudget = async (budgetId: string) => {
    if (user) {
      const path = `budgets/${budgetId}`;
      try {
        await deleteDoc(doc(db, 'budgets', budgetId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      setDemoBudgets(prev => prev.filter(b => b.id !== budgetId));
    }
  };

  // Seed Sample Data
  const handleSeedData = async (
    sampleList: Omit<Transaction, 'id' | 'createdAt'>[]
  ) => {
    if (user) {
      for (const item of sampleList) {
        try {
          await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            type: item.type,
            amount: item.amount,
            category: item.category,
            date: item.date,
            note: item.note || '',
            paymentMethod: item.paymentMethod || 'cash',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error(err);
        }
      }
    } else {
      const formatted: Transaction[] = sampleList.map((item, idx) => ({
        ...item,
        id: 'demo_' + Date.now() + '_' + idx,
        userId: 'demo_user',
        createdAt: new Date().toISOString(),
      }));
      setDemoTransactions(prev => [...formatted, ...prev]);
    }
  };

  // Quick launch demo mode
  const handleStartDemo = () => {
    setIsDemoMode(true);
    // Populate sample demo data
    const month = selectedMonth;
    setDemoTransactions([
      { id: '1', userId: 'demo', type: 'income', amount: 35000, category: 'เงินเดือน/ค่าจ้าง', date: `${month}-01`, note: 'เงินเดือนประจำเดือน', paymentMethod: 'bank_transfer', createdAt: '' },
      { id: '2', userId: 'demo', type: 'income', amount: 5000, category: 'งานเสริม/ฟรีแลนซ์', date: `${month}-12`, note: 'งานฟรีแลนซ์', paymentMethod: 'promptpay', createdAt: '' },
      { id: '3', userId: 'demo', type: 'expense', amount: 6500, category: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ', date: `${month}-02`, note: 'ค่าเช่าห้องพัก', paymentMethod: 'bank_transfer', createdAt: '' },
      { id: '4', userId: 'demo', type: 'expense', amount: 1200, category: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ', date: `${month}-05`, note: 'ค่าน้ำไฟ', paymentMethod: 'promptpay', createdAt: '' },
      { id: '5', userId: 'demo', type: 'expense', amount: 1500, category: 'การเดินทาง/ยานพาหนะ', date: `${month}-08`, note: 'เติมน้ำมันรถ', paymentMethod: 'credit_card', createdAt: '' },
      { id: '6', userId: 'demo', type: 'expense', amount: 2800, category: 'อาหารและเครื่องดื่ม', date: `${month}-10`, note: 'ค่าอาหารรวมสัปดาห์', paymentMethod: 'promptpay', createdAt: '' },
      { id: '7', userId: 'demo', type: 'expense', amount: 1650, category: 'ช้อปปิ้ง/ของใช้ส่วนตัว', date: `${month}-15`, note: 'ซื้อของใช้ส่วนตัว', paymentMethod: 'credit_card', createdAt: '' },
      { id: '8', userId: 'demo', type: 'expense', amount: 990, category: 'บันเทิง/ท่องเที่ยว/สังสรรค์', date: `${month}-18`, note: 'ดูหนังและทานอาหารนอกบ้าน', paymentMethod: 'cash', createdAt: '' },
    ]);
    setDemoBudgets([
      { id: 'b1', userId: 'demo', month, category: 'อาหารและเครื่องดื่ม', amount: 6000 },
      { id: 'b2', userId: 'demo', month, category: 'การเดินทาง/ยานพาหนะ', amount: 2500 },
      { id: 'b3', userId: 'demo', month, category: 'ช้อปปิ้ง/ของใช้ส่วนตัว', amount: 3000 },
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Prompt',sans-serif]">
      {/* App Header */}
      <Header
        user={user}
        firebaseProjectId={firebaseProjectId}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        onLogin={loginWithGoogle}
        onLogout={logout}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsFormModalOpen(true);
        }}
        onSeedData={() => setIsSeedModalOpen(true)}
        isFirebaseConnected={isFirebaseConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold underline"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Not Logged In & Not in Demo Banner */}
        {!user && !isDemoMode && (
          <div className="mb-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>เชื่อมต่อกับโปรเจกต์ Firebase: {firebaseProjectId}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                จัดการรายรับรายจ่ายฉลาดขึ้น พร้อมสรุปผลรายเดือนแบบเรียลไทม์
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                เก็บบันทึกข้อมูลการเงินของคุณอย่างปลอดภัยบน Firebase Firestore อัปเดตกราฟสัดส่วนการใช้จ่าย วางแผนงบประมาณ และวิเคราะห์แนวโน้มกระแสเงินสดได้ทันที
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={loginWithGoogle}
                  className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบด้วย Google เพื่อบันทึกข้อมูล</span>
                </button>
                <button
                  onClick={handleStartDemo}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all flex items-center gap-2 border border-white/10"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>ทดลองเล่นในโหมดตัวอย่าง (Demo)</span>
                </button>
              </div>
            </div>

            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
              <TrendingUp className="w-96 h-96 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Demo Mode Notice Banner */}
        {isDemoMode && !user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>คุณกำลังอยู่ใน <b>โหมดตัวอย่าง (Demo Preview)</b> เข้าสู่ระบบด้วย Google เพื่อบันทึกข้อมูลถาวรบน Firebase Firestore</span>
            </div>
            <button
              onClick={loginWithGoogle}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs"
            >
              เข้าสู่ระบบทันที
            </button>
          </div>
        )}

        {/* Metric Summary Cards */}
        <MetricCards
          totalIncome={monthlyStats.totalIncome}
          totalExpense={monthlyStats.totalExpense}
          netBalance={monthlyStats.netBalance}
          savingsRate={monthlyStats.savingsRate}
          dailyAvgExpense={monthlyStats.dailyAvgExpense}
          daysPassedInMonth={monthlyStats.daysPassedInMonth}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px mb-6 overflow-x-auto text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('charts')}
            className={`pb-3 px-3.5 transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'charts'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>กราฟวิเคราะห์ข้อมูล</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-3.5 transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>รายการรายรับ-รายจ่าย</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-normal">
              {currentTransactions.filter(t => t.date.startsWith(selectedMonth)).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('budgets')}
            className={`pb-3 px-3.5 transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'budgets'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>งบประมาณประจำเดือน</span>
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-3 px-3.5 transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'report'
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>สรุปผล & ส่งออก CSV</span>
          </button>
        </div>

        {/* Tab 1: Interactive Charts View */}
        {activeTab === 'charts' && (
          <ChartsView
            transactions={currentTransactions}
            selectedMonth={selectedMonth}
            allTransactions={currentTransactions}
          />
        )}

        {/* Tab 2: Transactions Feed & Management */}
        {activeTab === 'transactions' && (
          <TransactionList
            transactions={currentTransactions}
            selectedMonth={selectedMonth}
            onEdit={(tx) => {
              setEditingTransaction(tx);
              setIsFormModalOpen(true);
            }}
            onDelete={handleDeleteTransaction}
            onOpenAddModal={() => {
              setEditingTransaction(null);
              setIsFormModalOpen(true);
            }}
          />
        )}

        {/* Tab 3: Budget Planning & Alerts */}
        {activeTab === 'budgets' && (
          <BudgetManager
            budgets={currentBudgets}
            transactions={currentTransactions}
            selectedMonth={selectedMonth}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {/* Tab 4: Monthly Financial Statement & CSV Export */}
        {activeTab === 'report' && (
          <MonthlyReportView
            transactions={currentTransactions}
            selectedMonth={selectedMonth}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>ระบบจัดการรายรับรายจ่าย (Smart Expense Tracker)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>Firebase: {firebaseProjectId}</span>
            <span>•</span>
            <span className="text-emerald-600 font-sans font-semibold">จัดเก็บข้อมูลบน Firestore</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      {/* Seed Data Modal */}
      <SeedDataModal
        isOpen={isSeedModalOpen}
        onClose={() => setIsSeedModalOpen(false)}
        onSeed={handleSeedData}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
