import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Coins, 
  AlertCircle 
} from 'lucide-react';
import { Transaction } from '../types';
import { getCurrentYearMonth } from '../constants/categories';

interface SeedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeed: (transactions: Omit<Transaction, 'id' | 'createdAt'>[]) => Promise<void>;
  selectedMonth: string;
}

export const SeedDataModal: React.FC<SeedDataModalProps> = ({
  isOpen,
  onClose,
  onSeed,
  selectedMonth
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setIsSeeding(true);

      const [yStr, mStr] = selectedMonth.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);

      // Create realistic sample Thai transactions
      const sampleList: Omit<Transaction, 'id' | 'createdAt'>[] = [
        {
          userId: '',
          type: 'income',
          amount: 38000,
          category: 'เงินเดือน/ค่าจ้าง',
          date: `${selectedMonth}-01`,
          note: 'เงินเดือนประจำเดือนเข้าบัญชี',
          paymentMethod: 'bank_transfer',
        },
        {
          userId: '',
          type: 'income',
          amount: 6500,
          category: 'งานเสริม/ฟรีแลนซ์',
          date: `${selectedMonth}-10`,
          note: 'ค่าจ้างออกแบบกราฟิกและดูแลเพจ',
          paymentMethod: 'promptpay',
        },
        {
          userId: '',
          type: 'income',
          amount: 1200,
          category: 'การลงทุน/เงินปันผล/ดอกเบี้ย',
          date: `${selectedMonth}-15`,
          note: 'เงินปันผลกองทุนรวม',
          paymentMethod: 'bank_transfer',
        },
        {
          userId: '',
          type: 'expense',
          amount: 7500,
          category: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ',
          date: `${selectedMonth}-03`,
          note: 'ค่าเช่าห้องพักและส่วนกลาง',
          paymentMethod: 'bank_transfer',
        },
        {
          userId: '',
          type: 'expense',
          amount: 1450,
          category: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ',
          date: `${selectedMonth}-05`,
          note: 'ค่าน้ำประปาและค่าไฟฟ้า',
          paymentMethod: 'promptpay',
        },
        {
          userId: '',
          type: 'expense',
          amount: 699,
          category: 'อินเทอร์เน็ต/โทรศัพท์/สมาชิก',
          date: `${selectedMonth}-07`,
          note: 'ค่าอินเทอร์เน็ตบ้านไฟเบอร์',
          paymentMethod: 'credit_card',
        },
        {
          userId: '',
          type: 'expense',
          amount: 800,
          category: 'การเดินทาง/ยานพาหนะ',
          date: `${selectedMonth}-08`,
          note: 'เติมน้ำมันรถยนต์',
          paymentMethod: 'credit_card',
        },
        {
          userId: '',
          type: 'expense',
          amount: 350,
          category: 'อาหารและเครื่องดื่ม',
          date: `${selectedMonth}-09`,
          note: 'มื้อเที่ยงข้าวมันไก่และกาแฟอเมซอน',
          paymentMethod: 'promptpay',
        },
        {
          userId: '',
          type: 'expense',
          amount: 1250,
          category: 'อาหารและเครื่องดื่ม',
          date: `${selectedMonth}-12`,
          note: 'ชาบูบุฟเฟต์ฉลองวันหยุดกับเพื่อน',
          paymentMethod: 'promptpay',
        },
        {
          userId: '',
          type: 'expense',
          amount: 1890,
          category: 'ช้อปปิ้ง/ของใช้ส่วนตัว',
          date: `${selectedMonth}-14`,
          note: 'ซื้อของใช้เข้าบ้าน ซูเปอร์มาร์เก็ต',
          paymentMethod: 'credit_card',
        },
        {
          userId: '',
          type: 'expense',
          amount: 450,
          category: 'อาหารและเครื่องดื่ม',
          date: `${selectedMonth}-16`,
          note: 'ก๋วยเตี๋ยวเรือและชานมไข่มุก',
          paymentMethod: 'cash',
        },
        {
          userId: '',
          type: 'expense',
          amount: 950,
          category: 'การเดินทาง/ยานพาหนะ',
          date: `${selectedMonth}-18`,
          note: 'เติมน้ำมันและค่าทางด่วน',
          paymentMethod: 'credit_card',
        },
        {
          userId: '',
          type: 'expense',
          amount: 1200,
          category: 'บันเทิง/ท่องเที่ยว/สังสรรค์',
          date: `${selectedMonth}-20`,
          note: 'ดูหนังและบอร์ดเกมกับเพื่อน',
          paymentMethod: 'promptpay',
        },
        {
          userId: '',
          type: 'expense',
          amount: 500,
          category: 'สุขภาพ/ยารักษาโรค',
          date: `${selectedMonth}-22`,
          note: 'ซื้อวิตามินซีและยาแก้แพ้',
          paymentMethod: 'cash',
        },
      ];

      await onSeed(sampleList);
      setCompleted(true);
      setTimeout(() => {
        onClose();
        setCompleted(false);
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              สร้างชุดข้อมูลตัวอย่าง
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          ต้องการสร้างรายการรายรับและรายจ่ายตัวอย่างสำหรับเดือน <span className="font-semibold text-slate-900">{selectedMonth}</span> เพื่อทดสอบดูกราฟวิเคราะห์และสถิติต่างๆ ทันทีหรือไม่?
        </p>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 mb-5 text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>ระบบจะเพิ่มรายการเงินเดือน, ค่าอาหาร, ค่าที่พัก, ค่าน้ำมัน และงานเสริมลงในฐานข้อมูล Firestore ของคุณ</span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSeeding}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isSeeding || completed}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            {completed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>เพิ่มข้อมูลเรียบร้อย!</span>
              </>
            ) : isSeeding ? (
              <span>กำลังบันทึกลง Firebase...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>สร้างข้อมูลตัวอย่างเลย</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
