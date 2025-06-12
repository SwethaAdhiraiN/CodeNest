import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("viewer")
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")
    setOk("")
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({username, password, role})
    })
    if (res.ok) {
      setOk("Registration succeeded")
      setTimeout(() => navigate("/login"), 1200)
    } else {
      const err = await res.json()
      setError(err.error || "Registration failed")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      {ok && <div style={{color: 'green'}}>{ok}</div>}
      <label>Username: <input value={username} onChange={e => setUsername(e.target.value)} /></label><br/>
      <label>Password: <input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label><br/>
      <label>Role:
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="viewer">Viewer</option>
          <option value="contributor">Contributor</option>
          <option value="admin">Admin</option>
        </select>
      </label><br/>
      <button>Register</button>
    </form>
  )
}
export default RegisterPage
