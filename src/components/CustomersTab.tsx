import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, MessageCircle, FileText, Plus, X } from "lucide-react";
import { UserData, searchUsersCursor, UserSearchFilters } from "@/lib/firestore";
import { useLanguage } from "@/lib/LanguageContext";

const BATCH_SIZE = 15;

export default function CustomersTab({ onAddCustomer, onNewOrder }: { onAddCustomer: () => void, onNewOrder: (customer?: UserData) => void }) {
    const { t } = useLanguage();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const [customers, setCustomers] = useState<UserData[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<UserData | null>(null);
    const [cursor, setCursor] = useState<number | null>(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [totalCustomers, setTotalCustomers] = useState(0);

    // Debounce search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery]);

    // Fetch customers
    useEffect(() => {
        const fetchInitial = async () => {
            setLoading(true);
            try {
                const filters: UserSearchFilters = { query: debouncedQuery || undefined, sortBy: "newest" };
                const result = await searchUsersCursor(filters, 0, BATCH_SIZE);
                setCustomers(result.items);
                setCursor(result.nextCursor);
                setHasMore(result.hasMore);
                setTotalCustomers(result.total);
                // If a customer was selected but is no longer in the list, we might want to keep them selected or clear
                if (selectedCustomer && !result.items.find(c => c.uid === selectedCustomer.uid)) {
                    // optionally clear: setSelectedCustomer(null);
                }
            } catch (error) {
                console.error("Failed to fetch customers", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadMore = async () => {
        if (cursor === null || loading) return;
        setLoading(true);
        try {
            const filters: UserSearchFilters = { query: debouncedQuery || undefined, sortBy: "newest" };
            const result = await searchUsersCursor(filters, cursor, BATCH_SIZE);
            setCustomers(prev => [...prev, ...result.items]);
            setCursor(result.nextCursor);
            setHasMore(result.hasMore);
        } catch (error) {
            console.error("Failed to fetch more customers", error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex h-[calc(100vh-40px)] bg-white rounded-2xl overflow-hidden border border-figma-border shadow-sm">
            {/* Left Pane: Customer Directory */}
            <div className="w-[420px] bg-white border-r border-[#EADFCF] flex flex-col shrink-0">
                <div className="p-5 pb-4 border-b border-[#EADFCF]">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="font-bricolage font-extrabold tracking-tight text-[23px] text-figma-dark leading-none">Customers</h2>
                            <p className="text-[12.5px] text-figma-grayBrown mt-1">{totalCustomers} saved</p>
                        </div>
                        <button 
                            onClick={onAddCustomer}
                            className="h-[40px] px-[15px] rounded-xl bg-figma-gold flex items-center gap-[7px] text-[13.5px] font-extrabold text-figma-dark hover:opacity-90 transition-opacity"
                        >
                            <span className="text-[17px] font-light">+</span> Add
                        </button>
                    </div>
                    <div className="bg-[#F5EFE5] border border-[#EADFCF] rounded-xl px-[14px] py-[11px] flex items-center gap-[10px]">
                        <Search className="w-4 h-4 text-[#A6947F]" />
                        <input 
                            type="text" 
                            placeholder="Search name or phone number" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-[13.5px] w-full text-figma-dark placeholder-[#A6947F]"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="text-[#A6947F] hover:text-figma-dark">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Directory Header */}
                <div className="grid grid-cols-[1fr_62px_128px] gap-[10px] px-[22px] py-[11px] bg-[#FBF7F0] border-b border-[#EADFCF] text-[11.5px] font-extrabold tracking-[0.8px] text-[#9A8874]">
                    <span>NAME</span>
                    <span className="text-right">ORDERS</span>
                    <span className="text-right">PHONE</span>
                </div>

                {/* Directory List */}
                <div className="flex-1 overflow-y-auto">
                    {loading && customers.length === 0 ? (
                        <div className="flex items-center justify-center p-10">
                            <Loader2 className="w-6 h-6 animate-spin text-figma-gold" />
                        </div>
                    ) : customers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center gap-2">
                            <Search className="w-8 h-8 text-[#DFD2BF]" />
                            <p className="text-[13px] text-[#A6947F] max-w-[200px]">No customers found. Try adjusting your search.</p>
                        </div>
                    ) : (
                        customers.map((c) => {
                            const isSelected = selectedCustomer?.uid === c.uid;
                            return (
                                <div 
                                    key={c.uid}
                                    onClick={() => setSelectedCustomer(c)}
                                    className={`grid grid-cols-[1fr_62px_128px] gap-[10px] px-[22px] py-[13px] items-center border-b border-[#F1EBE3] cursor-pointer transition-colors hover:bg-[#FBF7F0] ${isSelected ? 'bg-[#F7EEDC] border-l-4 border-l-figma-gold pl-[18px]' : ''}`}
                                >
                                    <div className="flex items-center gap-[11px] overflow-hidden">
                                        <div className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center font-bricolage font-extrabold text-[12.5px] text-[#8A5A1E] shrink-0 ${isSelected ? 'bg-white' : 'bg-[#F1EBE3]'}`}>
                                            {getInitials(c.name)}
                                        </div>
                                        <span className={`text-[14.5px] truncate ${isSelected ? 'font-extrabold' : 'font-bold'} text-figma-dark`}>
                                            {c.name}
                                        </span>
                                    </div>
                                    <span className="text-[13.5px] font-bold text-[#5E4A38] text-right">
                                        {c.queryCount || 0}
                                    </span>
                                    <span className="text-[13px] text-figma-grayBrown text-right font-mono">
                                        {c.phoneNumber}
                                    </span>
                                </div>
                            );
                        })
                    )}
                    {hasMore && customers.length > 0 && (
                        <button 
                            onClick={loadMore}
                            disabled={loading}
                            className="w-full py-[16px] text-center text-[13.5px] font-extrabold text-[#8A5A1E] hover:bg-[#FBF7F0] transition-colors disabled:opacity-50"
                        >
                            {loading ? "Loading..." : `Load more · ${customers.length} of ${totalCustomers}`}
                        </button>
                    )}
                </div>
            </div>

            {/* Right Pane: Selected Customer Profile */}
            {selectedCustomer ? (
                <div className="flex-1 flex flex-col bg-[#FBF7F0] overflow-hidden">
                    <div className="bg-figma-dark px-7 py-5 flex items-center gap-4">
                        <div className="w-[52px] h-[52px] rounded-[15px] bg-figma-gold flex items-center justify-center font-bricolage font-extrabold text-[19px] text-figma-dark shrink-0">
                            {getInitials(selectedCustomer.name)}
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bricolage font-extrabold tracking-tight text-[23px] text-[#F7EEDC] leading-tight">
                                {selectedCustomer.name}
                            </h2>
                            <p className="text-[12.5px] text-[#B9A48A] mt-1">
                                {selectedCustomer.phoneNumber} &middot; customer since {selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'} &middot; {selectedCustomer.queryCount || 0} orders
                            </p>
                        </div>
                        <button 
                            onClick={() => onNewOrder(selectedCustomer)}
                            className="h-[40px] px-[15px] rounded-xl bg-figma-gold text-[13.5px] font-extrabold text-figma-dark hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            New order
                        </button>
                        <a 
                            href={`https://wa.me/${selectedCustomer.phoneNumber.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-[40px] px-[15px] rounded-xl bg-[#3B2A20] flex items-center gap-2 text-[13.5px] font-bold text-[#E7C87A] hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            <MessageCircle className="w-4 h-4" /> WhatsApp
                        </a>
                    </div>

                    <div className="px-7 pt-5 pb-2 flex items-center gap-3">
                        <div className="flex-1">
                            <h3 className="font-bricolage font-extrabold tracking-tight text-[19px] text-figma-dark">All measurements</h3>
                            <p className="text-[12.5px] text-figma-grayBrown mt-1">
                                {Object.keys(selectedCustomer.measurements || {}).length} garment sets on file
                            </p>
                        </div>
                        <button className="h-[40px] px-[15px] rounded-xl bg-white border border-[#E5D9C7] flex items-center gap-2 text-[13.5px] font-bold text-figma-dark hover:bg-gray-50 transition-colors">
                            <FileText className="w-4 h-4" /> Print sizes
                        </button>
                        <button className="h-[40px] px-[15px] rounded-xl bg-[#F7EEDC] border border-[#E7C87A] flex items-center gap-2 text-[13.5px] font-extrabold text-[#8A5A1E] hover:opacity-90 transition-opacity">
                            <Plus className="w-4 h-4" /> Add garment
                        </button>
                    </div>

                    <div className="flex-1 px-7 pb-6 overflow-y-auto flex flex-col gap-4 mt-2">
                        {Object.keys(selectedCustomer.measurements || {}).length === 0 ? (
                            <div className="bg-white border border-[#EADFCF] rounded-2xl p-8 text-center text-figma-grayBrown text-sm">
                                No measurements saved for this customer yet.
                            </div>
                        ) : (
                            Object.entries(selectedCustomer.measurements || {}).map(([garment, measures]) => (
                                <div key={garment} className="bg-white border border-[#EADFCF] rounded-2xl p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-[30px] h-[30px] rounded-lg bg-[#F7EEDC] flex items-center justify-center text-[14px] text-[#8A5A1E]">
                                            ◈
                                        </div>
                                        <span className="flex-1 text-[16px] font-extrabold text-figma-dark">{garment}</span>
                                        <button className="text-[12.5px] font-extrabold text-[#8A5A1E] hover:underline px-2">Edit</button>
                                    </div>
                                    <div className="flex flex-wrap gap-[9px]">
                                        {Object.entries(measures).map(([key, value]) => (
                                            <div key={key} className="bg-[#FBF7F0] border border-[#EADFCF] rounded-[10px] px-[11px] py-[9px] min-w-[70px]">
                                                <div className="text-[11px] text-figma-grayBrown">{key}</div>
                                                <div className="text-[16.5px] font-extrabold text-figma-dark mt-0.5">{value}</div>
                                            </div>
                                        ))}
                                        <button className="bg-transparent border border-dashed border-[#EADFCF] rounded-[10px] px-[11px] py-[9px] min-w-[70px] flex flex-col items-center justify-center text-figma-grayBrown hover:bg-gray-50 hover:text-figma-dark transition-colors">
                                            <Plus className="w-4 h-4 mb-0.5" />
                                            <span className="text-[10px] font-bold">Add</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center px-[70px] text-center bg-[#FBF7F0]">
                    <div className="w-[74px] h-[74px] rounded-[22px] bg-[#F1EBE3] flex items-center justify-center text-[30px] text-[#A6947F]">
                        ☺
                    </div>
                    <h3 className="font-bricolage font-extrabold tracking-tight text-[24px] text-figma-dark mt-5">
                        Pick a customer to see their sizes
                    </h3>
                    <p className="max-w-[400px] text-[14.5px] text-figma-grayBrown leading-relaxed mt-2.5">
                        Every garment they have ordered keeps its own set of measurements, and they all show here together.
                    </p>
                    <div className="flex items-center gap-3 mt-6">
                        <button 
                            onClick={onAddCustomer}
                            className="h-[46px] px-5 rounded-xl bg-figma-gold flex items-center gap-2 text-[14.5px] font-extrabold text-figma-dark hover:opacity-90 transition-opacity"
                        >
                            <span className="text-[18px] font-light">+</span> Add customer
                        </button>
                        <div className="h-[46px] px-5 rounded-xl bg-white border border-[#E5D9C7] flex items-center text-[14.5px] font-bold text-figma-dark cursor-text">
                            Search by phone
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
