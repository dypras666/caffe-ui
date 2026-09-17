const variantSelections = { "3": [{id:1, price_modifier: "2000.00"}], "4": [{id:2, price_modifier: "5000.00"}] };
const addonSelections = {};
const variantProduct = { price: "22000.00" };

let total = Number(variantProduct.price);
Object.values(variantSelections).forEach(arr => {
  (arr || []).forEach(v => {
    if (v?.price_modifier) total += Number(v.price_modifier);
  });
});
Object.values(addonSelections).forEach(arr => (arr || []).forEach(a => { if (a?.price) total += Number(a.price); }));

console.log("Total:", total);
