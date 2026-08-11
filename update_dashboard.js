const fs = require('fs');

const file = 'src/app/dashboard/DashboardContent.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add imports
if (!code.includes('useIsDesktop')) {
    code = code.replace(
        'import { useRouter } from "next/navigation";',
        'import { useRouter } from "next/navigation";\nimport { useIsDesktop } from "@/lib/useIsDesktop";\nimport AdminSidebar from "@/components/AdminSidebar";\nimport AdminMobileHeader from "@/components/AdminMobileHeader";\nimport AdminBottomNav from "@/components/AdminBottomNav";'
    );
}

// Replace the return block wrapper
const oldReturnStart = `    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="relative overflow-hidden" style={{ borderBottom: "1px solid var(--border-color)" }}>`;

const indexOfReturn = code.indexOf(oldReturnStart);
if (indexOfReturn === -1) {
    console.log("Could not find old return start");
    process.exit(1);
}

const oldReturnEndStr = `            <div className="mx-auto max-w-7xl px-4 lg:px-8 mt-6">
                {dataLoading ? (`;

const indexOfReturnEnd = code.indexOf(oldReturnEndStr);
if (indexOfReturnEnd === -1) {
    console.log("Could not find old return end");
    process.exit(1);
}

const newReturnWrapper = `    const isDesktop = useIsDesktop();
    return (
        <div className="flex h-screen w-full overflow-hidden bg-figma-bg text-figma-dark font-sans">
            {isDesktop && <AdminSidebar currentTab={currentTab} onTabChange={setCurrentTab} />}
            
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {!isDesktop && <AdminMobileHeader />}

                <main id="app-content" className="flex-1 overflow-y-auto relative flex flex-col pb-[80px] md:pb-0">

            <QuickAddModal
                isOpen={showQuickAdd}
                onClose={() => setShowQuickAdd(false)}
                onOrderCreated={loadData}
            />

            {/* New Order Modal */}
            <CreateOrderModal
                isOpen={showNewOrder}
                onClose={() => setShowNewOrder(false)}
                onOrderCreated={() => { setShowNewOrder(false); loadData(); }}
                allUsers={allUsers}
                garmentPrices={settings?.garmentPrices ?? {}}
            />

            {/* Edit Order Modal */}
            <EditOrderModal
                isOpen={!!editingOrder}
                order={editingOrder}
                onClose={() => setEditingOrder(null)}
                onOrderUpdated={() => { setEditingOrder(null); loadData(); }}
                garmentPrices={settings?.garmentPrices ?? {}}
            />

            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col min-h-0">
                {dataLoading ? (`;

// Replace from indexOfReturn to indexOfReturnEnd
code = code.substring(0, indexOfReturn) + newReturnWrapper + code.substring(indexOfReturnEnd + oldReturnEndStr.length);

// Also need to close the tags at the very bottom
const bottomOld = `                    </>
                )}
            </div>
        </div>
    );
}`;

const bottomNew = `                    </>
                )}
            </div>
            </main>
            {!isDesktop && <AdminBottomNav currentTab={currentTab} onTabChange={setCurrentTab} />}
            </div>
        </div>
    );
}`;

code = code.replace(bottomOld, bottomNew);

fs.writeFileSync(file, code);
console.log("Updated DashboardContent.tsx layout wrapper!");
