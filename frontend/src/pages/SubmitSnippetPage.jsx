import React, { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

function SubmitSnippetPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [language, setLanguage] = useState("")
  const [tags, setTags] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError("")
    const res = await fetch('/api/snippets', {
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        title,
        description,
        language,
        tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
        code
      })
    })
    if (res.ok) {
      navigate("/")
    } else {
      const err = await res.json()
      setError(err.error || "Failed to submit")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Submit Code Snippet</h2>
      {error && <div style={{color:'red'}}>{error}</div>}
      <label>Title: <input required value={title} onChange={e=>setTitle(e.target.value)} /></label><br/>
      <label>Description: <input value={description} onChange={e=>setDescription(e.target.value)} /></label><br/>
      <label>Language: <input value={language} onChange={e=>setLanguage(e.target.value)} /></label><br/>
      <label>Tags (comma separated): <input value={tags} onChange={e=>setTags(e.target.value)} /></label><br/>
      <label>Code:<br/>
        <textarea required value={code} onChange={e=>setCode(e.target.value)} rows={8} cols={50} />
      </label><br/>
      <button>Submit</button>
    </form>
  )
}
export default SubmitSnippetPage
