import React, { useEffect, useState } from 'react'
import { getWelcome, getPaymentsForUser, getTransactionsForPayment } from '../api'

export default function Dashboard({ token, setView, setPaymentsAction }) {
  const [welcomeHtml, setWelcomeHtml] = useState(null)
  const [metrics, setMetrics] = useState({ payments: 0, transactions: 0, totalCharged: 0 })
  const [recent, setRecent] = useState([])
  const renderSparkline = (values = [], stroke = '#60a5fa') => {
    if (!values || values.length === 0) return null
    const w = 88
    const h = 24
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const points = values.map((v, i) => {
      const x = Math.round((i / (values.length - 1)) * (w - 2)) + 1
      const y = Math.round(h - 4 - ((v - min) / range) * (h - 6))
      return `${x},${y}`
    }).join(' ')
    return (
      <svg width={w} height={h} className="mt-2">
        <polyline fill="none" stroke={stroke} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  useEffect(() => {
    const load = async () => {
      const username = localStorage.getItem('username') || 'user'
      try {
        const html = await getWelcome(username, token)
        setWelcomeHtml(html)
      } catch (err) {
        console.error('welcome error', err)
        setWelcomeHtml('<div>Unable to load welcome message</div>')
      }

      try {
        const userId = localStorage.getItem('userId') || 0
        // fetch payments and transactions to build sample metrics
        const payments = await getPaymentsForUser(userId, token).catch(() => [])
        let allTx = []
        for (const p of payments) {
          const txs = await getTransactionsForPayment(p.id, token).catch(() => [])
          allTx = allTx.concat(txs.map(t => ({ ...t, paymentType: p.type || p.paymentType, paymentId: p.id })))
        }
        const transactions = allTx.length
        const totalCharged = allTx.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0)
        // sort recent by createdAt if present
        const recentSorted = allTx.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return tb - ta
        }).slice(0, 5)

        setMetrics({ payments: payments.length, transactions, totalCharged })
        // introduce light randomization for demo metrics so values look lively
        const paymentsCount = payments.length || (2 + Math.floor(Math.random() * 4))
        const transactionsCount = transactions || Math.floor(Math.random() * 12)
        const chargedValue = totalCharged > 0 ? Math.round(totalCharged * (0.9 + Math.random() * 0.2)) : (500 + Math.floor(Math.random() * 5000))
        setMetrics({ payments: paymentsCount, transactions: transactionsCount, totalCharged: chargedValue })
        setRecent(recentSorted)
      } catch (err) {
        console.error('metrics error', err)
      }
    }

    load()
  }, [token])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Payment Methods</div>
            <div className="text-2xl font-bold">{metrics.payments || '0'}</div>
            {renderSparkline(Array.from({length:6}, () => 1 + Math.random()*4), '#3b82f6')}
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="p-3 bg-amber-50 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Transactions</div>
            <div className="text-2xl font-bold">{metrics.transactions || '0'}</div>
            {renderSparkline(Array.from({length:6}, () => Math.random()*10), '#f59e0b')}
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="p-3 bg-green-50 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-500">Total Charged</div>
            <div className="text-2xl font-bold">${(metrics.totalCharged/100).toFixed(2)}</div>
            {renderSparkline(Array.from({length:6}, () => 200 + Math.random()*1200), '#16a34a')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-2">Welcome</h3>
          <div dangerouslySetInnerHTML={{ __html: welcomeHtml || 'Loading…' }} />
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Recent Transactions</h3>
          {recent.length === 0 ? (
            // show mocked example transactions when there's no real data
            <ul className="divide-y divide-gray-100">
              <li className="py-3">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">Visa **** 1111</div>
                    <div className="text-sm text-gray-500">Payment Method</div>
                  </div>
                  <div className="text-green-600 font-semibold">$12.00</div>
                </div>
                <div className="text-xs text-gray-400">2026-03-25 14:32</div>
              </li>
              <li className="py-3">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">PayPal alice.paypal@example.com</div>
                    <div className="text-sm text-gray-500">PayPal</div>
                  </div>
                  <div className="text-green-600 font-semibold">$7.50</div>
                </div>
                <div className="text-xs text-gray-400">2026-03-24 09:12</div>
              </li>
            </ul>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map(t => (
                <li key={t.id} className="py-2">
                  <div className="flex justify-between">
                    <div className="text-sm">{t.paymentType || t.paymentId}</div>
                    <div className="text-sm text-gray-500">${(parseFloat(t.amount)||0)/100}</div>
                  </div>
                  <div className="text-xs text-gray-400">{t.createdAt}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-2">Account Balance</h3>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-sm text-gray-500">Available</div>
                <div className="text-2xl font-bold">$1,234.56</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Pending</div>
                <div className="text-lg text-amber-600">$45.00</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div style={{ width: '72%' }} className="h-full bg-green-500" />
              </div>
            </div>
          </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Quick Actions</h3>
        <div className="flex flex-col gap-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => { if (setPaymentsAction) setPaymentsAction('add'); if (setView) setView('payments'); }}>Add Payment Method</button>
          <button className="px-3 py-2 bg-amber-500 text-white rounded" onClick={() => { if (setPaymentsAction) setPaymentsAction('simulate'); if (setView) { setView('payments'); alert('Demo: select a card and press Charge to simulate a transaction.'); } else { alert('Demo: simulate charge'); } }}>Simulate Charge</button>
          <button className="px-3 py-2 bg-gray-200 rounded">View Account Settings</button>
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}
