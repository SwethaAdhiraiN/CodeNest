import React, { useEffect, useState } from 'react'

function FeedPage() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetch('/api/feed').then(async r => setEvents(await r.json()))
  }, [])
  return (
    <div>
      <h2>Activity Feed</h2>
      <ul>
        {events.map(e =>
          <li key={e.id + e.created_at}>
            {e.type === 'snippet'
              ? <>Snippet: <b>{e.title}</b> (by {e.author})</>
              : <>Comment by {e.author}: {e.text} (On snippet {e.snippet_id})</>
            }
            <span style={{marginLeft:12, fontSize:'smaller'}}>{e.created_at}</span>
          </li>
        )}
      </ul>
    </div>
  )
}
export default FeedPage
