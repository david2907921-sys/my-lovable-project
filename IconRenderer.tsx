
import React from 'react';
import { 
  Wifi, Key, Car, Wind, Tv, Coffee, Utensils, Flame, Waves, Trash2, LogOut, Info, 
  Moon, CigaretteOff, Stethoscope, Shirt, FireExtinguisher, Speaker, Thermometer, Lock, MapPin, 
  Zap, Heart, ShieldCheck, Star, HelpCircle, User, Phone, Mail, Camera, Music, Book
} from 'lucide-react';

export const ICON_MAP: Record<string, React.ElementType> = {
  Wifi, Key, Car, Wind, Tv, Coffee, Utensils, Flame, Waves, Trash2, LogOut, Info, 
  Moon, CigaretteOff, Stethoscope, Shirt, FireExtinguisher, Speaker, Thermometer, Lock, MapPin,
  Zap, Heart, ShieldCheck, Star, HelpCircle, User, Phone, Mail, Camera, Music, Book
};

export const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = ICON_MAP[name] || Info;
  return <IconComponent className={className} size={22} />;
};
