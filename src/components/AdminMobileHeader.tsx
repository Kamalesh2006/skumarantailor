"use client";

import React from "react";
import Image from "next/image";

export default function AdminMobileHeader() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="md:hidden bg-figma-dark pt-[env(safe-area-inset-top,20px)] px-5 text-[#F3E9DA]">
            <div className="flex items-center gap-3 py-3 pb-5">
                <div className="w-[34px] h-[34px] bg-figma-cream rounded-md flex items-center justify-center font-bold text-figma-dark">SK</div>
                <div className="flex-1">
                    <div className="font-bricolage font-extrabold tracking-tight text-[20px] leading-[1.1] text-figma-cream">
                        S Kumaran Tailors
                    </div>
                    <div className="text-[12px] text-figma-mutedGold mt-[3px]">
                        {today}
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="px-[13px] py-[6px] border border-[#4E3A2A] rounded-full text-[11.5px] font-extrabold text-[#E7C87A]">
                        EN
                    </div>
                    <div className="w-[34px] h-[34px] rounded-full bg-figma-darkHover flex items-center justify-center text-[15px] text-[#E7C87A] cursor-pointer">
                        ☰
                    </div>
                </div>
            </div>
        </div>
    );
}
