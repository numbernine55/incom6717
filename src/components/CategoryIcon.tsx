import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Receipt,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  Users,
  MoreHorizontal,
  Briefcase,
  Store,
  Gift,
  TrendingUp,
  Laptop,
  Coins,
  QrCode,
  Landmark,
  Banknote,
  CreditCard,
  Wallet,
  HelpCircle
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    case 'Gamepad2':
      return <Gamepad2 className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Store':
      return <Store className={className} />;
    case 'Gift':
      return <Gift className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'Laptop':
      return <Laptop className={className} />;
    case 'Coins':
      return <Coins className={className} />;
    case 'QrCode':
      return <QrCode className={className} />;
    case 'Landmark':
      return <Landmark className={className} />;
    case 'Banknote':
      return <Banknote className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Wallet':
      return <Wallet className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
