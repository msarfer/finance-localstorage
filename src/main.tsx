import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App.tsx'

const canonicalUrl = new URL('/', window.location.origin).toString()

let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
if (!canonical) {
  canonical = document.createElement('link')
  canonical.rel = 'canonical'
  document.head.appendChild(canonical)
}
canonical.href = canonicalUrl

let ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
if (!ogUrl) {
  ogUrl = document.createElement('meta')
  ogUrl.setAttribute('property', 'og:url')
  document.head.appendChild(ogUrl)
}
ogUrl.setAttribute('content', canonicalUrl)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
