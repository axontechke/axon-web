import { readFileSync, writeFileSync } from 'fs';

// Orders data from old DB
const orders = [
  {
    id: "AXN-827103", date: "2026-08-06T23:46:11.495Z", status: "delivered",
    customer: JSON.stringify({fullName:"Stephen Paul Kamau",email:"kamaustephenpaul@gmail.com",address:"100 Axon Technology Boulevard",city:"Nairobi",state:"County",zipCode:"00100"}),
    shippingMethod: "Express Overnight", shippingCost: 25, subtotal: 1148, discountAmount: 172.2, discountPercentage: 15, taxes: 58.54,
    total: 1059.34, totalKsh: 0, totalUsd: 0, hasKsh: 0,
    payment: JSON.stringify({lastFour:"8821"}),
    items: JSON.stringify([{id:"axon-slate-pro",name:"Axon Slate Pro",price:899,quantity:1,color:"Teal"},{id:"axon-buds-pro",name:"Axon Buds Pro",price:249,quantity:1,color:"Copper"}]),
    history: JSON.stringify([{status:"pending",time:"2026-08-06T23:46:11.495Z",notes:"Order received and validated."},{status:"packaged",time:"2026-08-07T04:34:11.495Z",notes:"System verification & aerospace packaging complete."},{status:"shipped",time:"2026-08-07T23:46:11.495Z",notes:"Dispatched via Priority Air Cargo. Tracking: AX-7711289"},{status:"delivered",time:"2026-08-08T23:46:11.495Z",notes:"Safely received. Signature certified."}]),
    shippingMethodName: "", shippingCarrier: "", shippingTrackingNumber: "", shippingDispatchedDate: "", createdAt: "2026-08-09 23:46:12"
  },
  {
    id: "AXN-982714", date: "2026-08-08T23:46:11.495Z", status: "shipped",
    customer: JSON.stringify({fullName:"Clarissa Mitchell",email:"clarissa.m@axon.net",address:"740 Silicon Alley, Flat 4B",city:"London",state:"Greater London",zipCode:"EC1A 1BB"}),
    shippingMethod: "Priority Overnight", shippingCost: 15, subtotal: 1499, discountAmount: 0, discountPercentage: 0, taxes: 90.84,
    total: 1604.84, totalKsh: 0, totalUsd: 0, hasKsh: 0,
    payment: JSON.stringify({lastFour:"4491"}),
    items: JSON.stringify([{id:"axon-book-16",name:"Axon Book 16",price:1499,quantity:1,color:"Space Gray"}]),
    history: JSON.stringify([{status:"pending",time:"2026-08-08T23:46:11.495Z",notes:"Payment authorized successfully."},{status:"packaged",time:"2026-08-09T04:34:11.495Z",notes:"Assembled and loaded into sterile power capsule."},{status:"shipped",time:"2026-08-09T11:46:11.495Z",notes:"In transit with courier. Expected delivery today."}]),
    shippingMethodName: "", shippingCarrier: "", shippingTrackingNumber: "", shippingDispatchedDate: "", createdAt: "2026-08-09 23:46:12"
  },
  {
    id: "AXN-312984", date: "2026-08-09T19:46:11.495Z", status: "packaged",
    customer: JSON.stringify({fullName:"Devon Chen",email:"devon.chen@coder.io",address:"12 Pine Street",city:"San Francisco",state:"CA",zipCode:"94103"}),
    shippingMethod: "Standard Express", shippingCost: 0, subtotal: 799, discountAmount: 0, discountPercentage: 0, taxes: 47.94,
    total: 846.94, totalKsh: 0, totalUsd: 0, hasKsh: 0,
    payment: JSON.stringify({lastFour:"1098"}),
    items: JSON.stringify([{id:"axon-phone-1-pro",name:"Axon Phone 1 Pro",price:799,quantity:1,color:"Obsidian"}]),
    history: JSON.stringify([{status:"pending",time:"2026-08-09T19:46:11.495Z",notes:"System routing complete."},{status:"packaged",time:"2026-08-09T21:46:11.495Z",notes:"Order finalized and sealed into anti-static container."}]),
    shippingMethodName: "", shippingCarrier: "", shippingTrackingNumber: "", shippingDispatchedDate: "", createdAt: "2026-08-09 23:46:12"
  }
];

// Delivery methods
const delivery = [
  {id: "del-dhl", name: "DHL Express Worldwide", price: 25, transitDays: "1-3 business days", carrier: "DHL Express", enabled: 1, description: "Secure door-to-door express courier with real-time flight tracking.", createdAt: "2026-08-09 23:46:12"},
  {id: "del-fedex", name: "FedEx International Priority", price: 15, transitDays: "2-4 business days", carrier: "FedEx", enabled: 1, description: "Reliable international priority delivery with thermal climate protection.", createdAt: "2026-08-09 23:46:12"},
  {id: "del-local", name: "Axon Prime Courier", price: 45, transitDays: "Same day (Nairobi / Local)", carrier: "Axon Logistics", enabled: 1, description: "Dedicated white-glove direct messenger service.", createdAt: "2026-08-09 23:46:12"}
];

// Generate INSERT statements
function escape(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return "'" + val.replace(/'/g, "''") + "'";
  return "'" + JSON.stringify(val).replace(/'/g, "''") + "'";
}

const cols = ["id","date","status","customer","shippingMethod","shippingCost","subtotal","discountAmount","discountPercentage","taxes","total","totalKsh","totalUsd","hasKsh","payment","items","history","shippingMethodName","shippingCarrier","shippingTrackingNumber","shippingDispatchedDate","createdAt"];
const orderStmts = orders.map(o => `INSERT INTO orders (${cols.map(c => `"${c}"`).join(',')}) VALUES (${cols.map(c => escape(o[c])).join(',')});`);
const deliveryCols = ["id","name","price","transitDays","carrier","enabled","description","createdAt"];
const deliveryStmts = delivery.map(d => `INSERT INTO delivery_methods (${deliveryCols.map(c => `"${c}"`).join(',')}) VALUES (${deliveryCols.map(c => escape(d[c])).join(',')});`);

const all = [...orderStmts, ...deliveryStmts];
writeFileSync('migrate_orders.sql', all.join('\n'));
console.log('Generated migrate_orders.sql with', all.length, 'statements');
console.log(orderStmts.length, 'orders,', deliveryStmts.length, 'delivery methods');
