const fs = require('fs');

const file = 'src/app/dashboard/DashboardContent.tsx';
let code = fs.readFileSync(file, 'utf8');

const start = `{/* ━━━ CUSTOMERS TAB ━━━ */}`;
const indexOfStart = code.indexOf(start);
const nextTabStart = `{/* ━━━ MONITORING TAB ━━━ */}`;
const indexOfNextTabStart = code.indexOf(nextTabStart);

if (indexOfStart === -1 || indexOfNextTabStart === -1) {
    console.log("Could not find customers boundaries");
    process.exit(1);
}

const newBlock = `                        {/* ━━━ CUSTOMERS TAB ━━━ */}
                        {currentTab === "customers" && (() => {
                            const today = new Date();
                            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
                            const newCustomersThisMonth = allUsers.filter(u => u.createdAt && u.createdAt >= firstDayOfMonth).length;

                            return (
                                <div className="flex flex-col h-full bg-figma-bg md:bg-white animate-fade-in">
                                    {/* Desktop View */}
                                    <div className="hidden md:flex flex-1 overflow-hidden">
                                        <div className="w-[420px] bg-white border-r border-figma-border flex flex-col overflow-hidden">
                                            <div className="p-[20px_22px_16px] border-b border-figma-border">
                                                <div className="flex items-center gap-[12px]">
                                                    <div className="flex-1">
                                                        <div className="font-bricolage font-extrabold tracking-[-0.5px] text-[23px] text-figma-dark">Customers</div>
                                                        <div className="text-[12.5px] text-figma-muted mt-[4px]">{allUsers.length} saved &middot; {newCustomersThisMonth} this month</div>
                                                    </div>
                                                    <button onClick={() => setEditingUser({ uid: "new_" + Date.now(), name: "", phoneNumber: "", role: "customer", measurements: {} })} className="h-[40px] px-[15px] rounded-[11px] bg-figma-gold flex items-center gap-[7px] text-[13.5px] font-extrabold text-figma-dark cursor-pointer hover:opacity-90">
                                                        <span className="text-[17px] font-light">+</span>Add
                                                    </button>
                                                </div>
                                                <div className="bg-figma-grayLight border border-figma-border rounded-[11px] p-[11px_14px] mt-[14px] flex items-center gap-[10px]">
                                                    <Search className="w-4 h-4 text-[#A6947F]" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Search name or phone number" 
                                                        value={customerSearch}
                                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                                        className="bg-transparent border-none outline-none text-[13.5px] text-figma-dark placeholder-[#A6947F] w-full"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-[1fr_74px_82px] gap-[10px] p-[11px_22px] bg-figma-bg border-b border-figma-border text-[11.5px] font-extrabold tracking-[0.8px] text-figma-text shrink-0">
                                                <span>NAME</span>
                                                <span className="text-right">ORDERS</span>
                                                <span className="text-right">PHONE</span>
                                            </div>

                                            <div className="overflow-y-auto flex-1">
                                                {displayedCustomers.map(user => {
                                                    const initials = user.name ? user.name.substring(0,2).toUpperCase() : "CU";
                                                    const userOrdersCount = orders.filter(o => o.customerId === user.uid || o.customerPhone === user.phoneNumber).length;
                                                    
                                                    return (
                                                        <div key={user.uid} onClick={() => setViewingCustomer(user)} className="grid grid-cols-[1fr_74px_82px] gap-[10px] p-[14px_22px] items-center border-b border-figma-grayLight cursor-pointer hover:bg-figma-cream">
                                                            <div className="flex items-center gap-[11px]">
                                                                <div className="w-[36px] h-[36px] rounded-[10px] bg-figma-grayLight flex items-center justify-center font-bricolage font-extrabold text-[12.5px] text-figma-goldDark">
                                                                    {initials}
                                                                </div>
                                                                <div className="overflow-hidden">
                                                                    <div className="text-[14.5px] font-bold text-figma-dark truncate">{user.name}</div>
                                                                </div>
                                                            </div>
                                                            <span className="text-[13.5px] font-bold text-figma-brown text-right">{userOrdersCount}</span>
                                                            <span className="text-[12px] text-figma-muted text-right truncate">{user.phoneNumber}</span>
                                                        </div>
                                                    );
                                                })}
                                                {customerGridHasMore && (
                                                    <div className="p-4 text-center">
                                                        <button onClick={loadMoreCustomerGrid} disabled={customerGridLoading} className="text-figma-goldDark font-bold text-sm">
                                                            {customerGridLoading ? "Loading..." : "Load more"}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex items-center justify-center bg-figma-bg">
                                            <div className="text-center text-figma-muted font-semibold">Select a customer from the list to view profile.</div>
                                        </div>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="md:hidden flex flex-col h-full bg-figma-bg pb-20">
                                        <div className="bg-figma-dark p-[env(safe-area-inset-top,20px)_18px_16px] text-figma-cream">
                                            <div className="flex items-center gap-[14px] pt-[8px]">
                                                <div className="flex-1">
                                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[20px] text-figma-cream">Customers</div>
                                                    <div className="text-[12px] text-figma-mutedGold mt-[2px]">{allUsers.length} saved</div>
                                                </div>
                                                <button onClick={() => setEditingUser({ uid: "new_" + Date.now(), name: "", phoneNumber: "", role: "customer", measurements: {} })} className="px-[13px] py-[6px] border border-[#4E3A2A] rounded-full text-[11.5px] font-extrabold text-figma-gold cursor-pointer">
                                                    ADD
                                                </button>
                                            </div>
                                            <div className="bg-figma-darkHover rounded-[14px] p-[12px_14px] mt-[14px] flex items-center gap-[10px]">
                                                <Search className="w-[15px] h-[15px] text-figma-mutedGold" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Search name or phone number" 
                                                    value={customerSearch}
                                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                                    className="flex-1 text-[14.5px] text-figma-cream bg-transparent border-none outline-none placeholder-figma-mutedGold font-sans"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 p-[14px_18px_20px] flex flex-col gap-[10px] overflow-y-auto">
                                            <div className="text-[11.5px] font-extrabold tracking-[1.2px] text-figma-text pl-[2px] pt-[8px]">ALL CUSTOMERS</div>
                                            {displayedCustomers.map((user, i) => {
                                                const initials = user.name ? user.name.substring(0,2).toUpperCase() : "CU";
                                                const userOrdersCount = orders.filter(o => o.customerId === user.uid || o.customerPhone === user.phoneNumber).length;
                                                return (
                                                    <div key={user.uid} onClick={() => setViewingCustomer(user)} className="bg-white border border-figma-border rounded-[16px] p-[14px] flex gap-[12px] items-center cursor-pointer">
                                                        <div className={\`w-[44px] h-[44px] rounded-[12px] \${i%2===0 ? 'bg-figma-cream' : 'bg-figma-grayLight'} flex items-center justify-center font-bricolage font-extrabold text-[15px] text-figma-goldDark\`}>
                                                            {initials}
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="text-[15.5px] font-bold text-figma-dark truncate">{user.name}</div>
                                                            <div className="text-[12.5px] text-figma-muted mt-[2px] truncate">{user.phoneNumber} &middot; {userOrdersCount} orders</div>
                                                        </div>
                                                        <span className="text-[18px] text-[#A6947F]">›</span>
                                                    </div>
                                                );
                                            })}
                                            {customerGridHasMore && (
                                                <div className="p-4 text-center">
                                                    <button onClick={loadMoreCustomerGrid} disabled={customerGridLoading} className="text-figma-goldDark font-bold text-sm">
                                                        {customerGridLoading ? "Loading..." : "Load more"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Include Customer Profile Modal in Customer Tab logic */}
                                    {viewingCustomer && (
                                        <CustomerDetailModal
                                            isOpen={!!viewingCustomer}
                                            customer={viewingCustomer}
                                            onClose={() => setViewingCustomer(null)}
                                            onEdit={(c) => { setEditingUser(c); setViewingCustomer(null); }}
                                            onDelete={(c) => { handleDeleteCustomer(c.uid, c.phoneNumber); setViewingCustomer(null); }}
                                        />
                                    )}

                                </div>
                            );
                        })()}
`;

code = code.substring(0, indexOfStart) + newBlock + code.substring(indexOfNextTabStart);

fs.writeFileSync(file, code);
console.log("Updated DashboardContent.tsx Customers block!");
