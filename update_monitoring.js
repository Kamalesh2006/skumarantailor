const fs = require('fs');

const file = 'src/app/dashboard/DashboardContent.tsx';
let code = fs.readFileSync(file, 'utf8');

const start = `{/* ━━━ MONITORING TAB ━━━ */}`;
const indexOfStart = code.indexOf(start);
const nextTabStart = `{/* ━━━ SETTINGS TAB ━━━ */}`;
const indexOfNextTabStart = code.indexOf(nextTabStart);

if (indexOfStart === -1 || indexOfNextTabStart === -1) {
    console.log("Could not find boundaries");
    process.exit(1);
}

const newBlock = `                        {/* ━━━ MONITORING TAB ━━━ */}
                        {currentTab === "monitoring" && (() => {
                            const cuttingOrders = orders.filter(o => o.status === "Cutting");
                            const stitchingOrders = orders.filter(o => o.status === "Stitching");
                            const alterationOrders = orders.filter(o => o.status === "Alteration");
                            const readyOrders = orders.filter(o => o.status === "Ready");

                            const capacityPercent = capacity > 0 ? Math.round((todayLoad / capacity) * 100) : 0;

                            return (
                                <div className="flex flex-col h-full bg-figma-bg md:bg-white animate-fade-in">
                                    {/* Desktop Header */}
                                    <div className="hidden md:flex bg-white border-b border-figma-border py-[18px] px-[30px] items-center gap-[20px] shrink-0">
                                        <div className="flex-1">
                                            <div className="font-bricolage font-extrabold tracking-[-0.5px] text-[25px] text-figma-dark leading-[1.1]">Monitoring</div>
                                            <div className="text-[13px] text-figma-muted mt-1">{orders.filter(o => o.status !== "Delivered").length} orders in the shop &middot; tap a card to move it one stage forward</div>
                                        </div>
                                        <div className="w-[280px]">
                                            <div className="flex justify-between text-[12px] font-bold text-figma-brown">
                                                <span>Today's capacity</span>
                                                <span className="text-figma-goldDark">{todayLoad} / {capacity} items</span>
                                            </div>
                                            <div className="h-[9px] rounded-[5px] bg-figma-grayLight overflow-hidden mt-[7px]">
                                                <div className="h-full bg-figma-gold" style={{ width: \`\${Math.min(capacityPercent, 100)}%\` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Header */}
                                    <div className="md:hidden bg-figma-dark p-[env(safe-area-inset-top,20px)_18px_16px] text-[#F3E9DA]">
                                        <div className="flex items-center gap-[14px] pt-[8px]">
                                            <span className="text-[22px] text-[#E7C87A] cursor-pointer" onClick={() => setCurrentTab("overview")}>‹</span>
                                            <div className="flex-1">
                                                <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[20px] text-figma-cream">Monitoring</div>
                                                <div className="text-[12px] text-figma-mutedGold mt-[2px]">{orders.filter(o => o.status !== "Delivered").length} orders in the shop</div>
                                            </div>
                                            <span className="text-[18px] text-[#E7C87A]">⌕</span>
                                        </div>
                                        <div className="bg-figma-darkHover rounded-[14px] p-[12px_14px] mt-[14px]">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[12.5px] font-semibold text-figma-mutedGold">Today's stitching capacity</span>
                                                <span className="text-[12.5px] font-extrabold text-[#E7C87A]">{todayLoad} / {capacity} items</span>
                                            </div>
                                            <div className="h-[8px] rounded-[4px] bg-[#4E3A2A] mt-[9px] overflow-hidden">
                                                <div className="h-full bg-figma-gold" style={{ width: \`\${Math.min(capacityPercent, 100)}%\` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kanban Board Container (Desktop) */}
                                    <div className="hidden md:grid flex-1 p-[22px_26px] grid-cols-4 gap-[16px] overflow-hidden bg-figma-bg">
                                        
                                        {/* Column: Cutting */}
                                        <div className="bg-[#F5EFE5] border border-figma-border rounded-[16px] p-[14px] flex flex-col gap-[11px] overflow-y-auto">
                                            <div className="flex items-baseline gap-[8px] px-1 shrink-0">
                                                <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-goldDark"></span>
                                                <span className="flex-1 text-[13.5px] font-extrabold text-figma-dark">Cutting</span>
                                                <span className="font-bricolage font-extrabold text-[16px] text-figma-goldDark">{cuttingOrders.length}</span>
                                            </div>
                                            {cuttingOrders.map(o => (
                                                <div key={o.orderId} onClick={() => handleStatusChange(o.orderId, "Stitching")} className="bg-white border border-figma-border rounded-[13px] p-[13px] cursor-pointer hover:shadow-sm transition-shadow">
                                                    <div className="text-[14px] font-bold text-figma-dark">{o.customerName}</div>
                                                    <div className="text-[12px] text-figma-muted mt-[3px]">{t(\`garment.\${o.garmentType}\`) || o.garmentType} &middot; {o.orderId}</div>
                                                    <div className="text-[11.5px] font-bold text-figma-muted mt-[9px]">
                                                        due {new Date(o.targetDeliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Column: Stitching */}
                                        <div className="bg-[#F5EFE5] border border-figma-border rounded-[16px] p-[14px] flex flex-col gap-[11px] overflow-y-auto">
                                            <div className="flex items-baseline gap-[8px] px-1 shrink-0">
                                                <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-gold"></span>
                                                <span className="flex-1 text-[13.5px] font-extrabold text-figma-dark">Stitching</span>
                                                <span className="font-bricolage font-extrabold text-[16px] text-figma-goldDark">{stitchingOrders.length}</span>
                                            </div>
                                            {stitchingOrders.map(o => (
                                                <div key={o.orderId} onClick={() => handleStatusChange(o.orderId, "Alteration")} className="bg-white border border-figma-border rounded-[13px] p-[13px] cursor-pointer hover:shadow-sm transition-shadow">
                                                    <div className="text-[14px] font-bold text-figma-dark">{o.customerName}</div>
                                                    <div className="text-[12px] text-figma-muted mt-[3px]">{t(\`garment.\${o.garmentType}\`) || o.garmentType} &middot; {o.orderId}</div>
                                                    <div className="text-[11.5px] font-bold text-figma-muted mt-[9px]">
                                                        due {new Date(o.targetDeliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Column: Alteration */}
                                        <div className="bg-[#F5EFE5] border border-figma-border rounded-[16px] p-[14px] flex flex-col gap-[11px] overflow-y-auto">
                                            <div className="flex items-baseline gap-[8px] px-1 shrink-0">
                                                <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-red"></span>
                                                <span className="flex-1 text-[13.5px] font-extrabold text-figma-dark">Alteration</span>
                                                <span className="font-bricolage font-extrabold text-[16px] text-figma-goldDark">{alterationOrders.length}</span>
                                            </div>
                                            {alterationOrders.map(o => (
                                                <div key={o.orderId} className="bg-white border border-[#F0CFC6] rounded-[13px] p-[13px]">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="text-[14px] font-bold text-figma-dark">{o.customerName}</span>
                                                    </div>
                                                    <div className="text-[12px] text-figma-muted mt-[3px]">{t(\`garment.\${o.garmentType}\`) || o.garmentType} &middot; {o.orderId}</div>
                                                    <button onClick={() => handleStatusChange(o.orderId, "Ready")} className="w-full h-[34px] rounded-[9px] bg-figma-gold text-figma-dark text-[12.5px] font-extrabold flex items-center justify-center mt-[10px] cursor-pointer hover:opacity-90">
                                                        Move to Ready
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Column: Ready */}
                                        <div className="bg-[#EAF0E4] border border-[#D3E0C8] rounded-[16px] p-[14px] flex flex-col gap-[11px] overflow-y-auto">
                                            <div className="flex items-baseline gap-[8px] px-1 shrink-0">
                                                <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-green"></span>
                                                <span className="flex-1 text-[13.5px] font-extrabold text-figma-dark">Ready</span>
                                                <span className="font-bricolage font-extrabold text-[16px] text-[#4F6742]">{readyOrders.length}</span>
                                            </div>
                                            {readyOrders.map(o => (
                                                <div key={o.orderId} className="bg-white border border-[#D3E0C8] rounded-[13px] p-[13px]">
                                                    <div className="text-[14px] font-bold text-figma-dark">{o.customerName}</div>
                                                    <div className="text-[12px] text-figma-muted mt-[3px]">{t(\`garment.\${o.garmentType}\`) || o.garmentType} &middot; Bin {o.binLocation || '-'}</div>
                                                    <button onClick={() => handleStatusChange(o.orderId, "Delivered")} className="w-full h-[34px] rounded-[9px] bg-[#25795A] text-white text-[12.5px] font-extrabold flex items-center justify-center gap-2 mt-[10px] cursor-pointer hover:opacity-90">
                                                        <span>✆</span> Notify & Deliver
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                    
                                    {/* Mobile Content (List) */}
                                    <div className="md:hidden flex-1 p-[14px_18px_80px] flex flex-col gap-[11px] overflow-y-auto bg-figma-bg">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-figma-dark">All Active Orders</span>
                                            <span className="text-[12px] text-figma-muted">Tap card to edit</span>
                                        </div>
                                        {orders.filter(o => o.status !== "Delivered").map(o => (
                                            <div key={o.orderId} className="bg-white border border-figma-border rounded-[18px] p-[15px_16px]">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-[15.5px] font-bold text-figma-dark">{o.customerName}</span>
                                                    <span className={\`text-[11.5px] font-extrabold \${o.status==='Ready'?'text-figma-green':'text-figma-goldDark'}\`}>
                                                        {o.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-[12.5px] text-figma-muted mt-[3px]">
                                                    {t(\`garment.\${o.garmentType}\`) || o.garmentType} &middot; {o.orderId}
                                                </div>
                                                <div className="flex gap-[9px] mt-[13px]">
                                                    <button 
                                                        onClick={() => {
                                                            const nextStatus = o.status === "Pending" ? "Cutting" : o.status === "Cutting" ? "Stitching" : o.status === "Stitching" ? "Alteration" : "Ready";
                                                            if (o.status !== "Ready") handleStatusChange(o.orderId, nextStatus);
                                                            else handleStatusChange(o.orderId, "Delivered");
                                                        }} 
                                                        className="flex-1 h-[44px] rounded-[12px] bg-figma-gold text-figma-dark text-[13.5px] font-extrabold flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                                                    >
                                                        {o.status === "Ready" ? "Deliver" : "Move to Next ➔"}
                                                    </button>
                                                    <button onClick={() => setEditingOrder(o)} className="w-[44px] h-[44px] rounded-[12px] bg-figma-grayLight text-figma-brown text-[16px] flex items-center justify-center cursor-pointer active:scale-95">⋯</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            );
                        })()}
`;

code = code.substring(0, indexOfStart) + newBlock + code.substring(indexOfNextTabStart);

fs.writeFileSync(file, code);
console.log("Updated DashboardContent.tsx Monitoring block!");
