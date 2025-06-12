import React, { useEffect, useState } from 'react'

function AuditPage() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetch('/api/audit')
      .then(async r => {
        if(r.ok) setLogs(await r.json())
      })
  }, [])

  return (
    <div>
      <h2>Audit Log</h2>
      <ul>
        {logs.map((l, i) => <li key={i}>
          [{l.timestamp}] {l.username}: {l.action} {l.detail && <>{l.detail}</>}
        </li>)}
      </ul>
    </div>
  )
}
export default AuditPage
