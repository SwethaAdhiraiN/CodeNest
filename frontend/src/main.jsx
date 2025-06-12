import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from './pages/App'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SnippetListPage from './pages/SnippetListPage'
import SnippetDetailPage from './pages/SnippetDetailPage'
import SnippetEditPage from './pages/SnippetEditPage'
import SubmitSnippetPage from './pages/SubmitSnippetPage'
import FeedPage from './pages/FeedPage'
import AuditPage from './pages/AuditPage'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<SnippetListPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="snippets/new" element={<SubmitSnippetPage />} />
        <Route path="snippets/:id" element={<SnippetDetailPage />} />
        <Route path="snippets/:id/edit" element={<SnippetEditPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
