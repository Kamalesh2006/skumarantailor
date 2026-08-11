const fs = require('fs');

const file = 'src/app/dashboard/DashboardContent.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldModal = `                                    {/* Include Customer Profile Modal in Customer Tab logic */}
                                    {viewingCustomer && (
                                        <CustomerDetailModal
                                            isOpen={!!viewingCustomer}
                                            customer={viewingCustomer}
                                            onClose={() => setViewingCustomer(null)}
                                        />
                                    )}`;
                                    
const newModal = `                                    {/* Include Customer Profile Modal in Customer Tab logic */}
                                    {viewingCustomer && (
                                        <CustomerDetailModal
                                            isOpen={!!viewingCustomer}
                                            customer={viewingCustomer}
                                            orders={orders.filter(o => o.customerPhone === viewingCustomer.phoneNumber)}
                                            onClose={() => setViewingCustomer(null)}
                                            onEditOrder={(order: any) => { setEditingOrder(order); setViewingCustomer(null); }}
                                            onEditCustomer={(c: any) => { setEditingUser(c); setViewingCustomer(null); }}
                                        />
                                    )}`;
                                    
code = code.replace(oldModal, newModal);

fs.writeFileSync(file, code);
console.log("TS fixes applied!");
