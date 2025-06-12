import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function SnippetEditPage() {
  const { id } = useParams()
  const [snippet, setSnippet] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [code, setCode] = useState("")
  const [tags, setTags] = useState("")
  const [language, setLanguage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`/api/snippets/${id}`).then(async r => {
      const s = await r.json()
      setSnippet(s)
      setTitle(s.title)
      setDescription(s.description)
      setCode(s.code)
      setTags(s.tags?.join(', ') || "")
      setLanguage(s.language)
    })
  }, [id])

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")
    const res = await fetch(`/api/snippets/${id}`, {
      method: 'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        title, description, code,
        tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
        language
      })
    })
    if (res.ok) {
      navigate(`/snippets/${id}`)
    } else {
      const err = await res.json()
      setError(err.error || "Update failed")
    }
  }

  if (!snippet) return <div>Loading…</div>

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Snippet</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <label>Title: <input required value={title} onChange={e=>setTitle(e.target.value)} /></label><br/>
      <label>Description: <input value={description} onChange={e=>setDescription(e.target.value)} /></label><br/>
      <label>Language: <input value={language} onChange={e=>setLanguage(e.target.value)} /></label><br/>
      <label>Tags: <input value={tags} onChange={e=>setTags(e.target.value)} /></label><br/>
      <label>Code:<br/>
        <textarea required value={code} onChange={e=>setCode(e.target.value)} rows={8} cols={50} />
      </label><br/>
      <button>Update</button>
    </form>
  )
}
export default SnippetEditPage
