import React, { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { setUser } = useOutletContext()

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({username, password})
    })
    if (res.ok) {
      const user = await res.json()
      setUser(user)
      navigate("/")
    } else {
      const err = await res.json()
      setError(err.error || "Login failed")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <label>Username: <input value={username} onChange={e=>setUsername(e.target.value)} /></label><br/>
      <label>Password: <input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label><br/>
      <button>Login</button>
    </form>
  )
}
export default LoginPage
