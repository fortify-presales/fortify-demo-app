import React from 'react'

export default function SideNav({ view, setView, onLogout }) {
  return (
    <div style={{ width: 200, borderRight: '1px solid #ccc', paddingRight: 10 }}>
      <h3>Menu</h3>
      <div>
        <button onClick={() => setView('dashboard')} style={{ display: 'block', marginBottom: 8 }}>Dashboard</button>
        <button onClick={() => setView('profile')} style={{ display: 'block', marginBottom: 8 }}>Profile</button>
        <button onClick={() => setView('payments')} style={{ display: 'block', marginBottom: 8 }}>Payments</button>
      </div>
      <div style={{ marginTop: 20 }}>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  )
}
