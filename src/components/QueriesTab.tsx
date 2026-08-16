"use client";

import React, { useState } from "react";
import { UserData } from "@/lib/firestore";

interface QueriesTabProps {
    allUsers: UserData[];
}

export default function QueriesTab({ allUsers }: QueriesTabProps) {
    
    // Filter users who have queries
    const queryingUsers = allUsers.filter(u => (u.queryCount ?? 0) > 0 || (u.queryHistory && u.queryHistory.length > 0))
        .sort((a, b) => (b.lastQueryAt ?? 0) - (a.lastQueryAt ?? 0));
        
    const [selectedUserId, setSelectedUserId] = useState<string | null>(queryingUsers.length > 0 ? queryingUsers[0].uid : null);
    
    const selectedUser = queryingUsers.find(u => u.uid === selectedUserId) || null;

    // Helper to get initials
    const getInitials = (name: string) => {
        if (!name || name === "Unknown") return "?";
        const parts = name.split(" ");
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex w-full h-full overflow-hidden bg-white animate-fade-in">
            {/* Left Sidebar - Query List */}
            <div className="w-full md:w-[400px] bg-white border-r border-[#EADFCF] flex flex-col overflow-hidden shrink-0">
                <div className="p-[20px_22px_14px] border-b border-[#EADFCF]">
                    <div className="font-bricolage font-extrabold tracking-[-0.5px] text-[23px] text-[#2A1D14]">Queries</div>
                    <div className="text-[12.5px] text-[#7A6A5C] mt-1">{queryingUsers.length} waiting &middot; 128 this month</div>
                    <div className="flex gap-[7px] mt-[14px]">
                        <span className="px-[13px] py-[8px] rounded-full bg-[#2A1D14] text-[#F7EEDC] text-[12.5px] font-bold cursor-pointer">All {queryingUsers.length}</span>
                        <span className="px-[13px] py-[8px] rounded-full bg-[#FBF7F0] border border-[#E5D9C7] text-[#5E4A38] text-[12.5px] font-semibold cursor-pointer">Unread {queryingUsers.filter(u => (u.queryCount || 0) > 0).length}</span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {queryingUsers.map(u => {
                        const isSelected = u.uid === selectedUserId;
                        const lastMsg = u.queryHistory?.[u.queryHistory.length - 1];
                        
                        return (
                            <div 
                                key={u.uid}
                                onClick={() => setSelectedUserId(u.uid)}
                                className={`flex gap-[12px] p-[15px_22px] border-b border-[#F1EBE3] cursor-pointer transition-colors ${isSelected ? 'bg-[#F7EEDC] border-l-4 border-l-[#C8912F]' : 'hover:bg-[#FBF7F0] border-l-4 border-l-transparent'}`}
                            >
                                <div className={`w-[38px] h-[38px] rounded-[11px] flex items-center justify-center font-bricolage font-extrabold text-[13px] shrink-0 ${isSelected ? 'bg-white text-[#8A5A1E]' : 'bg-[#F1EBE3] text-[#8A5A1E]'}`}>
                                    {getInitials(u.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-[8px]">
                                        <span className={`flex-1 text-[14.5px] truncate ${isSelected ? 'font-extrabold text-[#2A1D14]' : 'font-bold text-[#2A1D14]'}`}>{u.name || u.phoneNumber}</span>
                                        <span className={`text-[11.5px] ${isSelected ? 'text-[#8A5A1E]' : 'text-[#A6947F]'}`}>
                                            {u.lastQueryAt ? new Date(u.lastQueryAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="text-[12.5px] text-[#5E4A38] mt-[3px] leading-[1.4] line-clamp-2">
                                        {lastMsg?.text || "Customer sent a query regarding their order."}
                                    </div>
                                    
                                    {/* Mock Match Pill */}
                                    <span className="inline-block text-[11px] font-extrabold text-[#6E8B5E] bg-[#EAF0E4] px-[7px] py-[3px] rounded-[5px] mt-[6px]">
                                        ✓ MATCHED
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {queryingUsers.length === 0 && (
                        <div className="p-8 text-center text-[#7A6A5C] text-[13px] font-semibold">
                            No queries right now!
                        </div>
                    )}
                </div>
            </div>

            {/* Right Main Pane */}
            <div className="hidden md:flex flex-1 flex-col overflow-hidden bg-[#F5EFE5]">
                {selectedUser ? (
                    <>
                        <div className="bg-white border-b border-[#EADFCF] p-[16px_26px] flex items-center gap-[14px]">
                            <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F7EEDC] flex items-center justify-center font-bricolage font-extrabold text-[14px] text-[#8A5A1E]">
                                {getInitials(selectedUser.name)}
                            </div>
                            <div className="flex-1">
                                <div className="text-[17px] font-extrabold text-[#2A1D14]">{selectedUser.name || "Unknown"}</div>
                                <div className="text-[12.5px] text-[#7A6A5C] mt-[2px]">{selectedUser.phoneNumber}</div>
                            </div>
                            <button className="h-[40px] px-[16px] rounded-[11px] bg-[#F1EBE3] flex items-center text-[13.5px] font-bold text-[#5E4A38] hover:bg-[#E5DFD3] transition-colors">
                                ☎ Call
                            </button>
                        </div>

                        {/* Thread View */}
                        <div className="flex-1 p-[22px_26px] flex flex-col gap-[12px] overflow-y-auto">
                            <div className="text-center text-[11.5px] text-[#A6947F] font-extrabold tracking-[0.8px] my-4">QUERY HISTORY</div>
                            
                            {selectedUser.queryHistory?.map((msg, idx) => {
                                const isCustomer = msg.source === "WhatsApp" || msg.source === "Tracker";
                                return (
                                    <div key={idx} className={`max-w-[60%] flex flex-col ${isCustomer ? 'self-start' : 'self-end'}`}>
                                        <div className={`p-[13px_15px] ${isCustomer ? 'bg-white border border-[#EADFCF] rounded-[14px] rounded-tl-[4px]' : 'bg-[#2A1D14] rounded-[14px] rounded-tr-[4px]'}`}>
                                            <div className={`text-[14px] leading-[1.45] ${isCustomer ? 'text-[#2A1D14]' : 'text-[#F7EEDC]'}`}>
                                                {msg.text}
                                            </div>
                                            <div className={`text-[11px] mt-[6px] ${isCustomer ? 'text-[#A6947F]' : 'text-[#B9A48A]'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} &middot; {msg.source}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!selectedUser.queryHistory || selectedUser.queryHistory.length === 0) && (
                                <div className="text-center text-[#7A6A5C] text-[13px] my-auto">
                                    No detailed history available for this user.
                                </div>
                            )}
                        </div>

                        {/* Reply Box (Placeholder) */}
                        <div className="bg-white p-4 border-t border-[#EADFCF]">
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Type a reply..." 
                                    className="flex-1 bg-[#F5EFE5] rounded-[12px] px-4 text-[14px] outline-none border border-transparent focus:border-[#C8912F]"
                                />
                                <button className="h-[44px] px-6 rounded-[12px] bg-[#2A1D14] text-[#F7EEDC] text-[14px] font-bold">
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[#7A6A5C] font-semibold">
                        Select a query from the left to view details.
                    </div>
                )}
            </div>
        </div>
    );
}
