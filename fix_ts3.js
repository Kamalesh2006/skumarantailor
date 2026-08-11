const fs = require('fs');

const file = 'src/app/dashboard/DashboardContent.tsx';
let code = fs.readFileSync(file, 'utf8');

// Just replace the whole CustomerDetailModal tag using regex
code = code.replace(/<CustomerDetailModal[\s\S]*?\/>/, 
`<CustomerDetailModal
    isOpen={!!viewingCustomer}
    customer={viewingCustomer}
    orders={orders.filter(o => o.customerPhone === viewingCustomer.phoneNumber)}
    onClose={() => setViewingCustomer(null)}
    onEditOrder={(order) => { setEditingOrder(order); setViewingCustomer(null); }}
    onEditCustomer={(c) => { setEditingUser(c); setViewingCustomer(null); }}
/>`);

fs.writeFileSync(file, code);
console.log("TS fixes 3 applied!");
