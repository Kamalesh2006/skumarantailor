const fs = require('fs');

const file = 'src/app/dashboard/DashboardContent.tsx';
let code = fs.readFileSync(file, 'utf8');

const overviewStart = `{/* ━━━ OVERVIEW TAB — Today's Tasks ━━━ */}`;
const indexOfOverviewStart = code.indexOf(overviewStart);
const nextTabStart = `{/* ━━━ ORDERS TAB ━━━ */}`;
const indexOfNextTabStart = code.indexOf(nextTabStart);

const newOverview = `                        {/* ━━━ OVERVIEW TAB — Today's Tasks ━━━ */}
                        {currentTab === "overview" && (() => {
                            const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
                            
                            const readyOrders = orders.filter(o => o.status === "Ready");
                            const overdueOrders = orders.filter(o => {
                                if(o.status === "Delivered") return false;
                                const daysUntilDue = Math.ceil((new Date(o.targetDeliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                return daysUntilDue < 0;
                            });
                            const stitchingOrders = orders.filter(o => o.status === "Stitching");
                            const cuttingOrders = orders.filter(o => o.status === "Cutting");
                            const alterationOrders = orders.filter(o => o.status === "Alteration");
                            const inShopOrders = orders.filter(o => o.status !== "Delivered" && o.status !== "Ready");

                            // Deliver today orders (Ready + Overdue)
                            const deliverToday = [...readyOrders].sort((a,b) => new Date(a.targetDeliveryDate).getTime() - new Date(b.targetDeliveryDate).getTime()).slice(0, 5);

                            const capacityPercent = capacity > 0 ? Math.round((todayLoad / capacity) * 100) : 0;

                            return (
                                <div className="flex flex-col h-full bg-figma-bg md:bg-white animate-fade-in">
                                    {/* Desktop Header */}
                                    <div className="bg-white border-b border-figma-border py-[18px] px-[30px] hidden md:flex items-center gap-[20px] shrink-0">
                                        <div className="flex-1">
                                            <div className="font-bricolage font-extrabold tracking-tight text-[25px] text-figma-dark leading-[1.1]">{todayStr}</div>
                                            <div className="text-[13px] text-figma-muted mt-1">{readyOrders.length} to deliver &middot; {overdueOrders.length} overdue &middot; {stitchingOrders.length} stitching</div>
                                        </div>
                                        <div className="w-[320px] bg-figma-grayLight border border-figma-border rounded-[11px] px-[14px] py-[11px] flex items-center gap-[10px]">
                                            <Search className="w-4 h-4 text-figma-muted" />
                                            <input 
                                                type="text" 
                                                placeholder="Search customer, phone or order no." 
                                                className="bg-transparent border-none outline-none text-[13.5px] w-full text-figma-dark placeholder-figma-muted"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <button 
                                            onClick={() => setShowNewOrder(true)} 
                                            className="flex items-center gap-[10px] h-[44px] px-[18px] rounded-[12px] bg-figma-gold cursor-pointer hover:opacity-90 transition-opacity"
                                        >
                                            <span className="text-[20px] text-figma-dark font-light">+</span>
                                            <span className="text-[14.5px] font-extrabold text-figma-dark">New order</span>
                                        </button>
                                    </div>

                                    {/* Desktop Content */}
                                    <div className="hidden md:flex flex-1 p-[24px_30px] flex-col gap-[20px] overflow-y-auto bg-figma-bg">
                                        <div className="grid grid-cols-4 gap-[16px] shrink-0">
                                            <div onClick={() => { setStatusFilter("Ready"); setCurrentTab("orders"); }} className="bg-white border border-figma-border rounded-[16px] p-[18px_20px] cursor-pointer hover:shadow-md transition-shadow">
                                                <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-figma-text">TO DELIVER</div>
                                                <div className="font-bricolage font-extrabold tracking-[-1px] text-[36px] text-figma-dark leading-[1.05] mt-2">{readyOrders.length}</div>
                                                <div className="text-[12.5px] font-bold text-figma-red mt-1">{overdueOrders.length} overdue</div>
                                            </div>
                                            <div onClick={() => { setCurrentTab("orders"); }} className="bg-white border border-figma-border rounded-[16px] p-[18px_20px] cursor-pointer hover:shadow-md transition-shadow">
                                                <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-figma-text">IN THE SHOP</div>
                                                <div className="font-bricolage font-extrabold tracking-[-1px] text-[36px] text-figma-dark leading-[1.05] mt-2">{inShopOrders.length}</div>
                                                <div className="text-[12.5px] text-figma-muted mt-1">{cuttingOrders.length} cutting &middot; {stitchingOrders.length} stitching</div>
                                            </div>
                                            <div onClick={() => setCurrentTab("queries")} className="bg-white border border-figma-border rounded-[16px] p-[18px_20px] cursor-pointer hover:shadow-md transition-shadow">
                                                <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-figma-text">QUERIES</div>
                                                <div className="font-bricolage font-extrabold tracking-[-1px] text-[36px] text-figma-dark leading-[1.05] mt-2">128</div>
                                                <div className="text-[12.5px] font-bold text-figma-goldDark mt-1">4 waiting now</div>
                                            </div>
                                            <div onClick={() => setCurrentTab("revenue")} className="bg-figma-dark rounded-[16px] p-[18px_20px] cursor-pointer hover:shadow-lg hover:shadow-black/20 transition-all">
                                                <div className="text-[11.5px] font-extrabold tracking-[1.1px] text-figma-mutedGold">AUGUST REVENUE</div>
                                                <div className="font-extrabold tracking-[-1px] text-[31px] text-figma-cream leading-[1.05] mt-[9px]">₹1,42,300</div>
                                                <div className="text-[12.5px] text-[#E0CFAE] mt-[5px]">₹31,300 pending</div>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-[1.45fr_1fr] gap-[20px] min-h-0">
                                            {/* Deliver Today Table */}
                                            <div className="bg-white border border-figma-border rounded-[18px] flex flex-col overflow-hidden">
                                                <div className="p-[18px_22px_14px] flex items-baseline gap-[12px] border-b border-figma-grayLight shrink-0">
                                                    <span className="flex-1 font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-figma-dark">Deliver today</span>
                                                    <span onClick={() => setCurrentTab("orders")} className="text-[13px] font-bold text-figma-goldDark cursor-pointer hover:underline">See all orders</span>
                                                </div>
                                                <div className="grid grid-cols-[1fr_130px_96px_110px] gap-[14px] p-[11px_22px] bg-figma-bg border-b border-figma-grayLight text-[11.5px] font-extrabold tracking-[0.8px] text-figma-text shrink-0">
                                                    <span>CUSTOMER</span><span>GARMENT</span><span>AMOUNT</span><span></span>
                                                </div>
                                                <div className="overflow-y-auto flex-1">
                                                    {deliverToday.map(order => (
                                                        <div key={order.orderId} className="grid grid-cols-[1fr_130px_96px_110px] gap-[14px] p-[14px_22px] items-center border-b border-figma-grayLight hover:bg-gray-50/50">
                                                            <div className="flex items-center gap-[11px]">
                                                                <div className="w-[8px] h-[34px] rounded-[4px] bg-figma-green"></div>
                                                                <div>
                                                                    <div className="text-[14.5px] font-bold text-figma-dark">{order.customerName}</div>
                                                                    <div className="text-[12px] text-figma-muted mt-[2px]">{order.orderId} &middot; {order.binLocation || "No Bin"}</div>
                                                                </div>
                                                            </div>
                                                            <span className="text-[13.5px] text-figma-brown">{t(\`garment.\${order.garmentType}\`) || order.garmentType}</span>
                                                            <span className="text-[14px] font-extrabold text-figma-dark">₹{order.totalAmount}</span>
                                                            <button 
                                                                onClick={() => handleStatusChange(order.orderId, "Delivered")}
                                                                className="h-[36px] rounded-[10px] bg-figma-dark text-figma-cream text-[13px] font-bold flex items-center justify-center cursor-pointer hover:bg-figma-darkHover transition-colors"
                                                            >
                                                                Deliver
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {deliverToday.length === 0 && (
                                                        <div className="p-8 text-center text-figma-muted">No orders ready for delivery today.</div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="flex flex-col gap-[20px] overflow-y-auto">
                                                <div className="bg-white border border-figma-border rounded-[18px] p-[18px_20px] shrink-0">
                                                    <div className="flex items-baseline gap-[10px] mb-[14px]">
                                                        <span className="flex-1 font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-figma-dark">Queries waiting</span>
                                                        <span className="px-[9px] py-[4px] rounded-full bg-[#FBE9E4] text-figma-red text-[11.5px] font-extrabold">4</span>
                                                    </div>
                                                    <div className="flex flex-col gap-[11px]">
                                                        <div className="flex gap-[11px] items-start">
                                                            <div className="w-[34px] h-[34px] rounded-[10px] bg-figma-cream flex items-center justify-center font-bricolage font-extrabold text-[12.5px] text-figma-goldDark">RM</div>
                                                            <div className="flex-1">
                                                                <div className="text-[13.5px] font-bold text-figma-dark">Ramesh M.</div>
                                                                <div className="text-[12.5px] text-figma-muted mt-[2px] leading-[1.4]">Sir, shirt ready aacha?</div>
                                                            </div>
                                                        </div>
                                                        {/* Static demo content for queries for now */}
                                                    </div>
                                                    <button onClick={() => setCurrentTab("queries")} className="w-full h-[40px] rounded-[11px] bg-figma-grayLight border border-figma-border flex items-center justify-center text-[13px] font-bold text-figma-goldDark mt-[15px] hover:bg-figma-cream transition-colors">
                                                        Open all queries
                                                    </button>
                                                </div>

                                                <div className="bg-white border border-figma-border rounded-[18px] p-[18px_20px] shrink-0">
                                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-figma-dark mb-[6px]">Today's capacity</div>
                                                    <div className="text-[12.5px] text-figma-muted">{todayLoad} of {capacity} items loaded</div>
                                                    <div className="h-[10px] rounded-[5px] bg-figma-grayLight overflow-hidden mt-[13px]">
                                                        <div className="h-full bg-figma-gold" style={{ width: \`\${Math.min(capacityPercent, 100)}%\` }}></div>
                                                    </div>
                                                    <div className="flex flex-col gap-[9px] mt-[16px]">
                                                        <div className="flex items-center gap-[10px]">
                                                            <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-goldDark"></span>
                                                            <span className="flex-1 text-[13px] text-figma-brown">Cutting</span>
                                                            <span className="text-[13.5px] font-extrabold text-figma-dark">{cuttingOrders.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-[10px]">
                                                            <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-gold"></span>
                                                            <span className="flex-1 text-[13px] text-figma-brown">Stitching</span>
                                                            <span className="text-[13.5px] font-extrabold text-figma-dark">{stitchingOrders.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-[10px]">
                                                            <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-red"></span>
                                                            <span className="flex-1 text-[13px] text-figma-brown">Alteration</span>
                                                            <span className="text-[13.5px] font-extrabold text-figma-dark">{alterationOrders.length}</span>
                                                        </div>
                                                        <div className="flex items-center gap-[10px]">
                                                            <span className="w-[9px] h-[9px] rounded-[3px] bg-figma-green"></span>
                                                            <span className="flex-1 text-[13px] text-figma-brown">Ready</span>
                                                            <span className="text-[13.5px] font-extrabold text-figma-dark">{readyOrders.length}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Content */}
                                    <div className="md:hidden flex-1 flex flex-col gap-[18px] p-[18px_20px]">
                                        <div className="bg-white border border-figma-border rounded-[20px] p-[18px_18px_14px] shadow-[0_2px_8px_rgba(42,29,20,.05)]">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[12px] font-bold tracking-[1.4px] text-figma-text">TODAY</span>
                                                <span className="text-[12px] font-semibold text-figma-red">{overdueOrders.length} overdue</span>
                                            </div>
                                            <div className="flex gap-[10px] mt-[14px]">
                                                <div onClick={() => setCurrentTab("orders")} className="flex-1 bg-figma-cream rounded-[14px] p-[12px_12px_10px]">
                                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[30px] text-figma-dark leading-[1]">{readyOrders.length}</div>
                                                    <div className="text-[12px] text-figma-muted mt-[4px]">To deliver</div>
                                                </div>
                                                <div onClick={() => setCurrentTab("orders")} className="flex-1 bg-[#EAF0E4] rounded-[14px] p-[12px_12px_10px]">
                                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[30px] text-figma-dark leading-[1]">{stitchingOrders.length}</div>
                                                    <div className="text-[12px] text-figma-muted mt-[4px]">Stitching</div>
                                                </div>
                                                <div onClick={() => setCurrentTab("queries")} className="flex-1 bg-figma-grayLight rounded-[14px] p-[12px_12px_10px]">
                                                    <div className="font-bricolage font-extrabold tracking-[-0.4px] text-[30px] text-figma-dark leading-[1]">4</div>
                                                    <div className="text-[12px] text-figma-muted mt-[4px]">New queries</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-[10px]">
                                            <div className="flex justify-between items-baseline">
                                                <span className="font-bricolage font-extrabold tracking-[-0.4px] text-[18px] text-figma-dark">Due today</span>
                                                <span onClick={() => setCurrentTab("orders")} className="text-[13px] font-semibold text-figma-goldDark cursor-pointer">See all</span>
                                            </div>
                                            <div className="flex flex-col gap-[10px]">
                                                {deliverToday.map((order, i) => (
                                                    <div key={order.orderId} onClick={() => { /* view order */ }} className="bg-white border border-figma-border rounded-[16px] p-[14px] flex gap-[12px] items-center">
                                                        <div className={\`w-[44px] h-[44px] rounded-[12px] \${i%2===0 ? 'bg-[#FBE9E4] text-figma-red' : 'bg-figma-cream text-figma-goldDark'} flex items-center justify-center font-bricolage font-extrabold tracking-[-0.4px] text-[16px]\`}>
                                                            {order.customerName.substring(0,2).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-[15px] font-bold text-figma-dark">{order.customerName}</div>
                                                            <div className="text-[12.5px] text-figma-muted mt-[2px]">{t(\`garment.\${order.garmentType}\`) || order.garmentType} &middot; {order.orderId}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[11px] font-bold text-figma-green">READY</div>
                                                            <div className="text-[12px] text-figma-muted mt-[3px]">₹{order.totalAmount}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {deliverToday.length === 0 && (
                                                    <div className="p-4 text-center text-figma-muted text-sm border border-dashed border-figma-border rounded-xl">No orders ready</div>
                                                )}
                                            </div>
                                        </div>

                                        <div onClick={() => setCurrentTab("queries")} className="bg-figma-dark rounded-[18px] p-[15px_16px] flex gap-[12px] items-center mt-[10px] cursor-pointer active:scale-[0.98] transition-transform">
                                            <div className="w-[38px] h-[38px] rounded-[12px] bg-figma-green flex items-center justify-center text-[17px] text-white">✆</div>
                                            <div className="flex-1">
                                                <div className="text-[14px] font-bold text-figma-cream">4 WhatsApp queries</div>
                                                <div className="text-[12px] text-figma-mutedGold mt-[2px]">Latest: “Sir, dress ready aacha?”</div>
                                            </div>
                                            <span className="text-[18px] text-[#E7C87A]">›</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
`;

code = code.substring(0, indexOfOverviewStart) + newOverview + code.substring(indexOfNextTabStart);

fs.writeFileSync(file, code);
console.log("Updated DashboardContent.tsx Overview block!");
