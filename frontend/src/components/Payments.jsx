import React, { useEffect, useState } from 'react'
import { getUserByUsername, getPaymentsForUser, getTransactionsForPayment, createPayment, chargePayment } from '../api'
import AddPaymentMethod from './AddPaymentMethod'

export default function Payments({ token, paymentsAction, clearPaymentsAction }) {
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

  // respond to quick actions triggered from Dashboard
  useEffect(() => {
    if (!paymentsAction) return
    const run = async () => {
      if (paymentsAction === 'add') {
        // focus add payment method - delay clearing so AddPaymentMethod can see autoFocus
        if (clearPaymentsAction) setTimeout(() => clearPaymentsAction(), 200)
        return
      }
      if (paymentsAction === 'simulate') {
        // simulate a charge on the first payment if available
          if (payments.length > 0) {
          const first = payments[0]
          await handleCharge(first.id, 1.00)
        } else {
          // try reload payments then simulate
          const stored = localStorage.getItem('username') || 'user'
          const u = await getUserByUsername(stored, token)
          const ps = await getPaymentsForUser(u.id, token)
          setPayments(ps)
          if (ps.length > 0) await handleCharge(ps[0].id, 1.00)
        }
        if (clearPaymentsAction) clearPaymentsAction()
      }
    }
    run()
  }, [paymentsAction])

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
    <div className="flex gap-6">
      <div className="w-80">
        <h3 className="text-lg font-semibold mb-3">Payment Methods</h3>
        <ul className="bg-white rounded shadow divide-y divide-gray-100">
          {payments.map(p => (
            <li key={p.id} className={`p-3 cursor-pointer ${selected===p.id ? 'bg-gray-50' : ''}`} onClick={() => handleSelect(p.id)}>
              <div className="font-medium">{p.type}</div>
              <div className="text-sm text-gray-500">{p.status} — {p.createdAt}</div>
            </li>
          ))}
        </ul>
        <h3 className="text-lg font-semibold mt-4 mb-2">Add Payment Method</h3>
        <div className="card">
          <AddPaymentMethod onCreate={handleCreate} autoFocus={paymentsAction === 'add'} />
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-3">Transactions</h3>
        {selected ? (
          <div className="card">
              <div className="mb-3">
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => handleCharge(selected, 1.00)}>Charge $1.00</button>
            </div>
            <ul className="divide-y divide-gray-100">
              {transactions.map(t => (
                <li key={t.id} className="py-2">${Number(t.amount).toFixed(2)} — {t.status} — {t.createdAt}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-gray-600">Select a card to see transactions</div>
        )}
      </div>
    </div>
  )
}
