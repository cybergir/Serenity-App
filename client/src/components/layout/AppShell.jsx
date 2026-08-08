import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLimboCount } from '../../hooks/useTasks'
import { useTheme } from '../../hooks/useTheme'
import { usePush } from '../../hooks/usePush'

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data: limboData } = useLimboCount()
  const { theme, toggleTheme } = useTheme()
  const { permission, subscribed, subscribe, unsubscribe } = usePush()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const limboCount = limboData?.count || 0

  const navItems = [
    { to: '/', label: 'Today', icon: '☀️' },
    { to: '/tasks', label: 'Tasks', icon: '📋' },
    { to: '/capture', label: 'Capture', icon: '✨' },
    { to: '/insights', label: 'Insights', icon: '🌿' },
    { to: '/vault', label: 'Vault', icon: '💎' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Top bar */}
      <header className="bg-[var(--color-card)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-light text-[var(--color-text-primary)]">serenity</h1>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-lg p-1.5 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={subscribed ? unsubscribe : subscribe}
            className="text-lg p-1.5 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
            title={subscribed ? 'Notifications on' : 'Enable notifications'}
          >
            {subscribed ? '🔔' : '🔕'}
          </button>
          
          <span className="text-sm text-[var(--color-text-secondary)] hidden sm:inline">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Leave quietly
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <nav className="hidden md:flex flex-col w-56 bg-[var(--color-card)] border-r border-[var(--color-border)] min-h-[calc(100vh-57px)] p-4 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {limboCount > 0 && (
            <NavLink
              to="/tasks?destination=limbo"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 transition-colors"
            >
              <span>⏳</span>
              <span>Limbo</span>
              <span className="ml-auto bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-xs px-2 py-0.5 rounded-full">
                {limboCount}
              </span>
            </NavLink>
          )}

          <NavLink
            to="/presence"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors mt-auto"
          >
            <span>🧘</span>
            <span>Pause</span>
          </NavLink>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 max-w-4xl">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-card)] border-t border-[var(--color-border)] px-2 py-1 flex justify-around">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center px-2 py-1 text-xs rounded-lg transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-[var(--color-text-secondary)]'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/presence"
          className="flex flex-col items-center px-2 py-1 text-xs text-[var(--color-text-secondary)]"
        >
          <span className="text-lg">🧘</span>
          <span>Pause</span>
        </NavLink>
      </nav>
    </div>
  )
}