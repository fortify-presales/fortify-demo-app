import React, { useEffect, useState } from 'react'
import { getUserByUsername, getPaymentsForUser, getTransactionsForPayment, createPayment, chargePayment } from '../api'
import AddPaymentMethod from './AddPaymentMethod'

export default function Payments({ token }) {
  const [user, setUser] = useState(null)
  const [payments, setPayments] = useState([])
  const [selected, setSelected] = useState(null)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const load = async () => {
      const stored = localStorage.getItem('username') || 'user'
      const u = await getUserByUsername(stored, token)
      setUser(u)
      const ps = await getPaymentsForUser(u.id, token)
      setPayments(ps)
    }
    load()
  }, [token])

  const refreshPayments = async () => {
    if (!user) return
    const ps = await getPaymentsForUser(user.id, token)
    setPayments(ps)
    if (selected) {
      const txs = await getTransactionsForPayment(selected, token)
      setTransactions(txs)
    }
  }

  const handleSelect = async (paymentId) => {
    setSelected(paymentId)
    const txs = await getTransactionsForPayment(paymentId, token)
    setTransactions(txs)
  }

  const handleCreate = async (payment) => {
    const payload = { ...payment, userId: user.id, status: payment.status || 'ACTIVE' }
    await createPayment(payload, token)
    await refreshPayments()
  }

  const handleCharge = async (paymentId, amount) => {
    await chargePayment(paymentId, amount, token)
    const txs = await getTransactionsForPayment(paymentId, token)
    setTransactions(txs)
    await refreshPayments()
  }

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ width: 320 }}>
        <h3>Payment Methods</h3>
        <ul>
          {payments.map(p => (
            <li key={p.id} style={{ padding: 8, borderBottom: '1px solid #eee', cursor: 'pointer', background: selected===p.id ? '#fafafa' : undefined }} onClick={() => handleSelect(p.id)}>
              <div><strong>{p.type}</strong></div>
              <div>{p.status} — {p.createdAt}</div>
            </li>
          ))}
        </ul>
        <h3>Add Payment Method</h3>
        <AddPaymentMethod onCreate={handleCreate} />
      </div>

      <div style={{ flex: 1 }}>
        <h3>Transactions</h3>
        {selected ? (
          <div>
            <div style={{ marginBottom: 8 }}>
              <button onClick={() => handleCharge(selected, 100)}>Charge $1.00</button>
            </div>
            <ul>
              {transactions.map(t => (
                <li key={t.id}>{t.amount} — {t.status} — {t.createdAt}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>Select a card to see transactions</div>
        )}
      </div>      
    </div>
  )
}
