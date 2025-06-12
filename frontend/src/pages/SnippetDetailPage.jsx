import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useOutletContext } from 'react-router-dom'

function SnippetDetailPage() {
  const { id } = useParams()
  const [snippet, setSnippet] = useState(null)
  const [error, setError] = useState("")
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const { user } = useOutletContext()
  const navigate = useNavigate()

  const fetchSnippet = async () => {
    const res = await fetch(`/api/snippets/${id}`)
    if (res.ok) setSnippet(await res.json())
    else setError("Snippet not found")
  }
  const fetchComments = async () => {
    const res = await fetch(`/api/snippets/${id}/comments`)
    if (res.ok) setComments(await res.json())
  }

  useEffect(() => {
    fetchSnippet()
    fetchComments()
    // eslint-disable-next-line
  }, [id])

  const handleUpvote = async () => {
    await fetch(`/api/snippets/${id}/upvote`, { method: 'POST' })
    fetchSnippet()
  }

  const handleDownload = async () => {
    const r = await fetch(`/api/snippets/${id}/download`, { method: 'POST' })
    if (r.ok) {
      const data = await r.json()
      const blob = new Blob([data.code], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${snippet.title}.txt`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  const handleComment = async e => {
    e.preventDefault()
    if (!comment.trim()) return
    const res = await fetch(`/api/snippets/${id}/comments`, {
      method: 'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({text: comment})
    })
    if (res.ok) {
      setComment("")
      fetchComments()
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete snippet?")) return
    const res = await fetch(`/api/snippets/${id}`, { method:'DELETE' })
    if (res.ok) navigate("/")
  }

  if (error) return <div>{error}</div>
  if (!snippet) return <div>Loading…</div>

  return (
    <div>
      <h2>{snippet.title}</h2>
      <pre>{snippet.code}</pre>
      <div>{snippet.description}</div>
      <div>By {snippet.author} | {snippet.language} | Tags: {snippet.tags?.join(', ')}</div>
      <div>Upvotes: {snippet.upvotes} | Downloads: {snippet.downloads}</div>
      <button onClick={handleUpvote}>Upvote</button>
      <button onClick={handleDownload}>Download</button>
      {(user && (user.username === snippet.author || user.role === 'admin')) &&
        <>
          <Link to={`/snippets/${id}/edit`}>Edit</Link>
          <button onClick={handleDelete}>Delete</button>
        </>
      }
      <h3>Comments</h3>
      <form onSubmit={handleComment}>
        <textarea value={comment} onChange={e => setComment(e.target.value)}></textarea><br />
        <button>Add Comment</button>
      </form>
      <ul>
        {comments.map(c => (
          <li key={c.id}>{c.author}: {c.text} <span style={{fontSize:'smaller'}}>{c.created_at}</span></li>
        ))}
      </ul>
      <h3>History</h3>
      <ul>
        {(snippet.versions || []).map((v, i) => (
          <li key={i}>
            Edited at {v.updated_at || v.created_at}, by {v.author || snippet.author}
            <pre>{v.code}</pre>
          </li>
        ))}
      </ul>
    </div>
  )
}
export default SnippetDetailPage
