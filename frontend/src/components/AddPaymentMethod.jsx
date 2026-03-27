import React, { useState } from 'react'

export default function AddPaymentMethod({ onCreate, autoFocus }) {
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

  React.useEffect(() => {
    if (autoFocus) {
      // focus the first input for quick add
      const el = document.querySelector('.card .input')
      if (el && typeof el.focus === 'function') el.focus()
    }
  }, [autoFocus])

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">Type</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="card">Credit Card</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>
      {type === 'card' ? (
        <>
          <div>
            <label className="label">Credit Card Number</label>
            <input className="input" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          </div>
          <div>
            <label className="label">Expiry Date</label>
            <input className="input" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
          </div>
          <div>
            <label className="label">CVV</label>
            <input className="input" value={cvv} onChange={(e) => setCvv(e.target.value)} />
          </div>
        </>
      ) : (
        <div>
          <label className="label">PayPal Email</label>
          <input className="input" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} />
        </div>
      )}
      <div className="mt-2">
        <button className="px-3 py-2 bg-blue-600 text-white rounded" type="submit">Add</button>
      </div>
    </form>
  )
}
