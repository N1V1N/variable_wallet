# Tax & Shipping Configuration Guide

## ✅ What's Set Up

### **Free Shipping**
- All orders ship for **$0.00**
- Displayed to customers during checkout
- Clearly shown in PayPal breakdown

### **Automatic Sales Tax Calculation**
- Tax calculated based on customer's **shipping address**
- Uses 2024 state tax rates for all 50 US states + DC
- Updates in real-time when customer enters their address

---

## 🗺️ How Tax Calculation Works

### **Step-by-Step:**

1. **Customer adds items to cart**
   - Initial tax: $0.00 (no address yet)

2. **Customer clicks PayPal/Venmo button**
   - PayPal popup opens

3. **Customer enters shipping address**
   - `onShippingChange` callback fires
   - System looks up tax rate for their state
   - Tax is calculated: `Subtotal × State Tax Rate`
   - Order total updates automatically

4. **Customer sees final price**
   - Subtotal: (items × $33)
   - Tax: (calculated based on state)
   - Shipping: $0.00 (FREE)
   - **Total: Subtotal + Tax**

5. **Customer completes payment**
   - Full breakdown logged to console
   - Visible in your PayPal dashboard

---

## 📊 State Tax Rates (2024)

### **No Sales Tax:**
- Alaska (AK): 0%
- Delaware (DE): 0%
- Montana (MT): 0%
- New Hampshire (NH): 0%
- Oregon (OR): 0%

### **Lowest Tax States:**
- Colorado (CO): 2.9%
- Alabama (AL): 4.0%
- New York (NY): 4.0%
- Wyoming (WY): 4.0%

### **Highest Tax States:**
- California (CA): 7.25%
- Indiana (IN): 7.0%
- Mississippi (MS): 7.0%
- Rhode Island (RI): 7.0%
- Tennessee (TN): 7.0%

### **Example Calculations:**

| State | Tax Rate | 1 Item ($33) | 3 Items ($99) |
|-------|----------|--------------|---------------|
| CA    | 7.25%    | $2.39 tax    | $7.18 tax     |
| TX    | 6.25%    | $2.06 tax    | $6.19 tax     |
| FL    | 6.0%     | $1.98 tax    | $5.94 tax     |
| NY    | 4.0%     | $1.32 tax    | $3.96 tax     |
| OR    | 0%       | $0.00 tax    | $0.00 tax     |

---

## 🔍 Where to See Tax Information

### **In PayPal Dashboard:**
1. Go to PayPal.com → Activity
2. Click any transaction
3. View "Transaction details"
4. See breakdown:
   - Subtotal
   - Tax
   - Shipping ($0.00)
   - Total

### **In Browser Console (for debugging):**
1. Press F12 → Console tab
2. After successful payment, see:
   ```
   === ORDER COMPLETED SUCCESSFULLY ===
   Subtotal: $99.00
   Tax: $7.18
   Shipping: $0.00
   Total Amount: $106.18
   ```

---

## ⚙️ Updating Tax Rates

Tax rates are stored in `script.js` around line 567-580.

**To update annually:**
1. Open `script.js`
2. Find `const stateTaxRates = {`
3. Update rates as needed
4. Format: `'STATE_CODE': 0.RATE`
   - Example: California 7.25% = `'CA': 0.0725`

**When to update:**
- Beginning of each year
- When states change tax rates
- Check: https://taxfoundation.org/data/all/state/sales-tax-rates-2024/

---

## 🌍 International Orders

**Current Setup:** US states only

**For international orders:**
- Tax will default to 0% (no state code match)
- You may need to:
  - Add international tax rates
  - Use a third-party tax service (TaxJar, Avalara)
  - Handle tax manually

**To add international support:**
Contact me or modify `stateTaxRates` object to include country codes.

---

## 💡 Important Notes

### **Legal Compliance:**
- ✅ You're collecting sales tax based on destination (correct)
- ✅ Tax rates are current as of 2024
- ⚠️ You must remit collected taxes to each state
- ⚠️ Some states require seller permits

### **Tax Remittance:**
You are responsible for:
1. Tracking taxes collected per state
2. Filing sales tax returns (monthly/quarterly/annually)
3. Paying collected taxes to each state
4. Registering for sales tax permits in states where you have nexus

**Resources:**
- [Streamlined Sales Tax](https://www.streamlinedsalestax.org/)
- [State Tax Websites](https://www.taxadmin.org/state-tax-agencies)
- Consider using [TaxJar](https://www.taxjar.com/) or [Avalara](https://www.avalara.com/) for automation

### **PayPal Reporting:**
- PayPal provides transaction reports
- Export to CSV/Excel for tax reporting
- Filter by date range for tax periods

---

## 🛠️ Troubleshooting

### **Tax not showing:**
- Customer hasn't entered address yet
- Will show as $0.00 until address entered
- Check console for "Shipping address changed" log

### **Wrong tax amount:**
- Verify state code in console log
- Check tax rate in `stateTaxRates` object
- Update rates if outdated

### **Tax showing on zero-tax states:**
- Should be $0.00 for AK, DE, MT, NH, OR
- Check console for state code
- Verify rate is set to `0.00` in object

---

## 📞 Need Help?

- Tax rate updates: Edit `script.js` line 567-580
- Change shipping cost: Edit line 652 (currently `0.00`)
- Tax questions: Consult a tax professional
- Technical issues: Check browser console (F12)

---

**Last Updated:** November 6, 2025  
**Tax Rates:** 2024 rates (update annually)  
**Shipping:** FREE ($0.00)
