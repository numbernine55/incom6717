import { CategoryItem, PaymentMethod } from '../types';

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: 'text-orange-500', bgColor: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'transport', name: 'การเดินทาง/ยานพาหนะ', type: 'expense', icon: 'Car', color: 'text-blue-500', bgColor: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'shopping', name: 'ช้อปปิ้ง/ของใช้ส่วนตัว', type: 'expense', icon: 'ShoppingBag', color: 'text-pink-500', bgColor: 'bg-pink-50 text-pink-600 border-pink-200' },
  { id: 'housing', name: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ', type: 'expense', icon: 'Home', color: 'text-amber-500', bgColor: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'bills', name: 'อินเทอร์เน็ต/โทรศัพท์/สมาชิก', type: 'expense', icon: 'Receipt', color: 'text-indigo-500', bgColor: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  { id: 'entertainment', name: 'บันเทิง/ท่องเที่ยว/สังสรรค์', type: 'expense', icon: 'Gamepad2', color: 'text-purple-500', bgColor: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'health', name: 'สุขภาพ/ยารักษาโรค', type: 'expense', icon: 'HeartPulse', color: 'text-rose-500', bgColor: 'bg-rose-50 text-rose-600 border-rose-200' },
  { id: 'education', name: 'การศึกษา/พัฒนาตนเอง', type: 'expense', icon: 'GraduationCap', color: 'text-teal-500', bgColor: 'bg-teal-50 text-teal-600 border-teal-200' },
  { id: 'family', name: 'ครอบครัว/สัตว์เลี้ยง', type: 'expense', icon: 'Users', color: 'text-emerald-500', bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'other_expense', name: 'ค่าใช้จ่ายอื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: 'text-slate-500', bgColor: 'bg-slate-100 text-slate-600 border-slate-200' },
];

export const INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'salary', name: 'เงินเดือน/ค่าจ้าง', type: 'income', icon: 'Briefcase', color: 'text-emerald-500', bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'business', name: 'ธุรกิจส่วนตัว/ค้าขาย', type: 'income', icon: 'Store', color: 'text-cyan-500', bgColor: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
  { id: 'bonus', name: 'โบนัส/คอมมิชชั่น', type: 'income', icon: 'Gift', color: 'text-amber-500', bgColor: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'investment', name: 'การลงทุน/เงินปันผล/ดอกเบี้ย', type: 'income', icon: 'TrendingUp', color: 'text-violet-500', bgColor: 'bg-violet-50 text-violet-600 border-violet-200' },
  { id: 'freelance', name: 'งานเสริม/ฟรีแลนซ์', type: 'income', icon: 'Laptop', color: 'text-blue-500', bgColor: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'Coins', color: 'text-lime-500', bgColor: 'bg-lime-50 text-lime-600 border-lime-200' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const PAYMENT_METHODS: { id: PaymentMethod; name: string; icon: string }[] = [
  { id: 'promptpay', name: 'พร้อมเพย์ (PromptPay)', icon: 'QrCode' },
  { id: 'bank_transfer', name: 'โอนผ่านธนาคาร', icon: 'Landmark' },
  { id: 'cash', name: 'เงินสด', icon: 'Banknote' },
  { id: 'credit_card', name: 'บัตรเครดิต/เดบิต', icon: 'CreditCard' },
  { id: 'other', name: 'อื่นๆ', icon: 'Wallet' },
];

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const thaiYear = year + 543;
  return `${day} ${THAI_MONTHS_SHORT[monthIdx] || ''} ${thaiYear}`;
}

export function formatMonthName(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const [yearStr, monthStr] = yearMonthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  const thaiYear = year + 543;
  return `${THAI_MONTHS[monthIdx] || ''} ${thaiYear}`;
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCurrentDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
