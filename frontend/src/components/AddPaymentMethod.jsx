import React, { useState } from 'react'

export default function AddPaymentMethod({ onCreate }) {
  const [type, setType] = useState('card')
  const [cardNumber, setCardNumber] = useState('4111111111111111')
  const [cardExpiry, setCardExpiry] = useState('12/25')
  const [cvv, setCvv] = useState('123')
  const [paypalEmail, setPaypalEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      type,
      cardNumber: type === 'card' ? cardNumber : null,
      cardExpiry: type === 'card' ? cardExpiry : null,
      cvv: type === 'card' ? cvv : null,
      paypalEmail: type === 'paypal' ? paypalEmail : null
    }
    await onCreate(payload)
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
      <div>
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="card">Credit Card</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>
      {type === 'card' ? (
        <>
          <div>
            <label>Credit Card Number</label>
            <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          </div>
          <div>
            <label>Expiry Date</label>
            <input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
          </div>
          <div>
            <label>CVV</label>
            <input value={cvv} onChange={(e) => setCvv(e.target.value)} />
          </div>
        </>
      ) : (
        <div>
          <label>PayPal Email</label>
          <input value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} />
        </div>
      )}
      <div style={{ marginTop: 6 }}>
        <button type="submit">Add Payment Method</button>
      </div>
    </form>
  )
}
