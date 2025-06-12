import React, { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'

function SnippetListPage() {
  const [snippets, setSnippets] = useState([])
  const [q, setQ] = useState("")
  const [tag, setTag] = useState("")
  const [language, setLanguage] = useState("")
  const [error, setError] = useState("")
  const {user} = useOutletContext()

  const fetchSnippets = async (filters={}) => {
    let url = '/api/snippets'
    const params = []
    if (filters.q) params.push(`q=${encodeURIComponent(filters.q)}`)
    if (filters.tag) params.push(`tag=${encodeURIComponent(filters.tag)}`)
    if (filters.language) params.push(`language=${encodeURIComponent(filters.language)}`)
    if (params.length) url += `?${params.join('&')}`
    const res = await fetch(url)
    if (res.ok) {
      setSnippets(await res.json())
    } else {
      setError("Failed to fetch snippets")
    }
  }
  useEffect(()=>{ fetchSnippets({}) }, [])

  const handleSearch = e => {
    e.preventDefault()
    fetchSnippets({q, tag, language})
  }

  return (
    <div>
      <h2>Code Snippets</h2>
      <form onSubmit={handleSearch}>
        <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
        <input placeholder="Tag" value={tag} onChange={e=>setTag(e.target.value)} />
        <input placeholder="Language" value={language} onChange={e=>setLanguage(e.target.value)} />
        <button>Search</button>
        {user && (user.role==='admin' || user.role==='contributor') &&
          <Link to="/snippets/new" style={{marginLeft:16}}>Submit New</Link>}
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      <ul>
        {snippets.map(s => (
          <li key={s.id}>
            <Link to={`/snippets/${s.id}`}>{s.title}</Link>
            <span style={{marginLeft:8, fontSize:'small'}}>{s.language} {s.tags?.map(t => `#${t}`).join(' ')}</span>
            <span style={{marginLeft:8}}>[{s.upvotes} upvotes, {s.downloads} downloads]</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
export default SnippetListPage
