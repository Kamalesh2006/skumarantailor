"use client";

import React from 'react';
import Image from 'next/image';
import { Plus, Sun, LogOut, User, Languages } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function AdminDesktopHeader({ onQuickAdd }: { onQuickAdd: () => void }) {
    const { logout } = useAuth();
    const { lang, toggleLang } = useLanguage();

    return (
        <header className="hidden md:flex h-[64px] bg-[#1a1a1a] text-white items-center justify-between px-6 shrink-0 z-30">
            <div className="flex items-center gap-3">
                <div className="w-[32px] h-[32px] relative flex items-center justify-center">
                    <Image src="/sewing-machine-gold.png" alt="Logo" width={28} height={28} className="object-contain" priority />
                </div>
                <span className="font-bricolage font-extrabold text-[18px] tracking-wide text-figma-cream">S Kumaran Tailors</span>
            </div>
            
            <div className="flex items-center gap-5">
                <button 
                    onClick={onQuickAdd}
                    className="flex items-center gap-2 h-[34px] px-4 rounded-[8px] bg-[#2a2a2a] border border-[#333] hover:bg-[#333] transition-colors"
                >
                    <Plus className="w-[15px] h-[15px] text-figma-gold" />
                    <span className="text-[13px] font-bold text-figma-gold">Quick Add</span>
                </button>

                <button onClick={toggleLang} className="flex items-center gap-[6px] hover:text-figma-gold transition-colors text-gray-300">
                    <Languages className="w-4 h-4" />
                    <span className="text-[13px] font-bold">{lang === 'en' ? 'தமிழ்' : 'EN'}</span>
                </button>

                <button className="hover:text-figma-gold transition-colors text-gray-300">
                    <Sun className="w-[18px] h-[18px]" />
                </button>

                <div className="flex items-center gap-4 pl-5 border-l border-[#333]">
                    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[8px] bg-[#2a2a2a]">
                        <User className="w-[15px] h-[15px] text-gray-400" />
                        <span className="text-[13px] font-semibold text-gray-200">User</span>
                        <span className="text-[10px] font-extrabold text-figma-dark bg-figma-gold px-2 py-0.5 rounded-[4px]">Admin</span>
                    </div>

                    <button onClick={logout} className="flex items-center gap-2 hover:text-white transition-colors text-gray-400">
                        <LogOut className="w-[15px] h-[15px]" />
                        <span className="text-[13px] font-semibold">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
