import React from 'react'

export default function SideNav({ view, setView, onLogout }) {
  const username = localStorage.getItem('username') || 'User'
  const initial = username.charAt(0).toUpperCase()

  // Resolve Swagger URL: when running the frontend dev server (5173),
  // point to the backend at :8080. In production (served from backend),
  // use the relative path so it works behind the same origin.
  let swaggerHref = '/swagger-ui/index.html'
  try {
    if (typeof window !== 'undefined' && window.location && window.location.port === '5173') {
      swaggerHref = `${window.location.protocol}//${window.location.hostname}:8080/swagger-ui/index.html`
    }
  } catch (e) {
    // fallback to relative path
  }

  const NavButton = ({ active, onClick, icon, children, href }) => {
    const base = `flex items-center gap-3 px-3 py-2 rounded w-full text-left ${active ? 'bg-gray-100' : 'hover:bg-gray-50'}`
    if (href) return (
      <a
        className={base}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          // open and focus the new tab/window; fallback to navigation if blocked
          e.preventDefault()
          try {
            const w = window.open(href, '_blank')
            if (w && typeof w.focus === 'function') {
              w.focus()
            } else {
              window.location.href = href
            }
          } catch (err) {
            window.location.href = href
          }
        }}
      >
        {icon}
        <span>{children}</span>
      </a>
    )
    return (
      <button className={base} onClick={onClick}>
        {icon}
        <span>{children}</span>
      </button>
    )
  }

  return (
    <div className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">{initial}</div>
        <div>
          <div className="text-sm font-medium">{username}</div>
          <div className="text-xs text-gray-500">Demo account</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        <NavButton active={view==='dashboard'} onClick={() => setView('dashboard')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3z" /></svg>}>
          Dashboard
        </NavButton>

        <NavButton active={view==='profile'} onClick={() => setView('profile')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.485 0 4.807.634 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}>
          Profile
        </NavButton>

        <NavButton active={view==='payments'} onClick={() => setView('payments')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"/></svg>}>
          Payments
        </NavButton>

        <NavButton active={view==='users'} onClick={() => setView('users')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-4-4h-1"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20H4v-2a4 4 0 014-4h1"/><circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/></svg>}>
          Users
        </NavButton>

        <NavButton href={swaggerHref} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5z"/></svg>}>
          API Docs (Swagger)
        </NavButton>
      </nav>

      <div className="mt-6">
        <button className="px-3 py-2 bg-red-500 text-white rounded w-full" onClick={onLogout}>Logout</button>
      </div>
    </div>
  )
}
