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
        <NavButton active={view==='dashboard'} onClick={() => setView('dashboard')} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /></svg>}>
          Dashboard
        </NavButton>

        <NavButton active={view==='profile'} onClick={() => setView('profile')} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>}>
          Profile
        </NavButton>

        <NavButton active={view==='payments'} onClick={() => setView('payments')} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>}>
          Payments
        </NavButton>

        <NavButton active={view==='users'} onClick={() => setView('users')} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>}>
          Users
        </NavButton>

        <NavButton active={view==='files'} onClick={() => setView('files')} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M7 21h10a2 2 0 002-2V7.5a2.5 2.5 0 00-2.5-2.5H6.5A2.5 2.5 0 004 7.5V19a2 2 0 002 2z" /></svg>}>
          Files
        </NavButton>

        
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <NavButton href={swaggerHref} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>}>
          API Docs
        </NavButton>

        <div className="mt-4">
          <button className="px-3 py-2 bg-red-500 text-white rounded w-full" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </div>
  )
}
