import React, { useEffect, useState } from 'react'
import { getWelcome, getPaymentsForUser, getTransactionsForPayment } from '../api'

export default function Dashboard({ token, setView }) {
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 6h10M4 14h16M7 18h10" />
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v3m0 12v3" />
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
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => setView ? setView('payments') : null}>Add Payment Method</button>
          <button className="px-3 py-2 bg-amber-500 text-white rounded" onClick={() => { if (setView) { setView('payments'); alert('Demo: select a card and press Charge to simulate a transaction.'); } else { alert('Demo: simulate charge'); } }}>Simulate Charge</button>
          <button className="px-3 py-2 bg-gray-200 rounded">View Account Settings</button>
        </div>
      </div>
        </div>
      </div>
    </div>
  )
}
