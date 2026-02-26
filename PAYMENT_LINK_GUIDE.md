# Stripe Payment Link Feature - Integration Guide

## ✅ Feature Status
The Stripe payment link generation feature is now **fully functional** and ready to integrate into the messaging system.

## How It Works

### 1. Backend Endpoint
**POST** `/leads/{lead_id}/payment-link`

Creates a Stripe payment link for a lead's deal.

**Requirements:**
- Lead must exist
- Deal must exist for the lead
- Deal must have `final_price_aud` set (quoted price alone is not enough)

**Response:**
```json
{
  "payment_link": "https://buy.stripe.com/8x28wQ...",
  "session_id": "plink_1T4vnyIQxfh3...",
  "amount": 2500.0,
  "business_name": "Cafe Test Business",
  "message": "Payment link created successfully. Share this link with your client."
}
```

### 2. Integration Steps

To integrate payment links into messages, follow these steps:

#### Step 1: Create/Update Deal with Final Price
Before generating a payment link, ensure the deal has both quoted and final prices:

```python
# PATCH /leads/{lead_id}/deal
{
  "quoted_price_aud": 2500,
  "final_price_aud": 2500
}
```

#### Step 2: Generate Payment Link
```python
# POST /leads/{lead_id}/payment-link
# No body needed, returns payment link URL
```

#### Step 3: Use in Messages
Store the `payment_link` URL and include it in outbound messages:

```python
# POST /leads/{lead_id}/messages
{
  "channel": "EMAIL",
  "body": "Hi [owner_name], here's your custom website quote. You can pay here: [PAYMENT_LINK]\n\nTotal Amount: A$[FINAL_PRICE]",
  "template_id": "...",
  "variables": {
    "owner_name": "John",
    "PAYMENT_LINK": "https://buy.stripe.com/8x28wQ...",
    "FINAL_PRICE": "2500"
  }
}
```

## Frontend Integration Example

In your messaging modal/form:

```typescript
// 1. When user clicks "Generate Payment Link" button
const handleGeneratePaymentLink = async (leadId: string) => {
  const response = await fetch(`/api/leads/${leadId}/payment-link`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  return data.payment_link // "https://buy.stripe.com/..."
}

// 2. Insert into message template
const insertPaymentLink = (paymentLink: string) => {
  const textArea = document.querySelector('textarea')
  const currentText = textArea.value
  textArea.value = currentText + '\n\n' + paymentLink
}

// 3. Usage in send message flow
const onSendMessage = async () => {
  const paymentLink = await handleGeneratePaymentLink(leadId)
  const messageBody = `[Your message]\n${paymentLink}`
  // Send message with payment link included
}
```

## Configuration

The Stripe API key is automatically loaded from your `.env` file:

```env
STRIPE_SECRET_KEY=...
```

✅ Verified: Stripe is configured and working!

## API Response Examples

### Success (200)
```json
{
  "payment_link": "https://buy.stripe.com/8x28wQ2cW4IK0N6280fYY00",
  "session_id": "plink_1T4vnyIQxfh3ralWCS1W1Oaw",
  "amount": 2500.0,
  "business_name": "Cafe Test Business",
  "message": "Payment link created successfully. Share this link with your client."
}
```

### Error: Missing Final Price (400)
```json
{
  "detail": "Deal final price not set"
}
```

### Error: Deal Not Found (404)
```json
{
  "detail": "Deal not found"
}
```

## Testing

Run the test script to verify everything is working:

```bash
uv run python /tmp/test_payment.py
```

Expected output:
```
✅ Login: 200
✅ Create Lead: 201
✅ Get/Create Deal: 200
✅ Update Deal: 200
✅ Create Payment Link: 200
   Business: Cafe Test Business
   Amount: A$2500.00
   Session ID: plink_1T4vnyIQxfh3...
   Payment Link: https://buy.stripe.com/...
✨ SUCCESS!
```

## Next Steps

1. **Frontend**: Add "Generate Payment Link" button to the DealTab or MessageTab
2. **Integration**: When composing a message, allow users to:
   - Click "Add Payment Link" button
   - System generates link automatically
   - Link is inserted into message template
3. **Tracking**: Optionally store the `session_id` to track payment status

## Troubleshooting

**"Stripe not configured"**
- Check `.env` file has `STRIPE_SECRET_KEY=......`
- Restart backend: `bash /Users/andersonvieira/Documents/lovable-crm/start-backend.sh`
- Check backend logs for "✅ Stripe is configured" message

**"Deal final price not set"**
- Before generating payment link, ensure deal has `final_price_aud` set
- Use PATCH `/leads/{lead_id}/deal` to update the price first

**Payment link is empty/null**
- Verify Stripe API key is valid
- Check Stripe account is active and in good standing
