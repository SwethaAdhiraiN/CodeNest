import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'

function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/auth/me').then(async r => {
      if (r.ok) setUser(await r.json())
    })
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    navigate('/login')
  }

  return (
    <div>
      <nav>
        <span style={{fontWeight: 'bold', fontSize:'1.4em', marginRight:24}}>CodeNest</span>
        <Link to="/">Snippets</Link>
        <Link to="/feed">Feed</Link>
        {user?.role==='admin' &&
          <Link to="/audit">Audit</Link>}
        {user ?
          <>
            <span style={{marginLeft:20}}>{user.username} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </> :
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        }
      </nav>
      <main style={{margin:'2em'}}>
        <Outlet context={{user, setUser}} />
      </main>
    </div>
  )
}

export default App
