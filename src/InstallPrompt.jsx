import { useEffect, useState } from 'react'

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function detectPlatform() {
  const ua = window.navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

export default function InstallPrompt() {
  const [platform] = useState(detectPlatform)
  const [installed, setInstalled] = useState(isStandalone)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onPrompt(e) {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    function onInstalled() {
      setInstalled(true)
      setOpen(false)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || platform === 'other') return null

  async function handleClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return
    }
    setOpen(true)
  }

  return (
    <>
      <button type="button" className="install-banner" onClick={handleClick}>
        📲 הוסף את האפליקציה למסך הבית
      </button>

      {open && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="install-modal">
            <button className="modal-close" onClick={() => setOpen(false)} aria-label="סגור">✕</button>
            {platform === 'ios' ? (
              <>
                <h2>הוספה למסך הבית (iPhone)</h2>
                <ol className="install-steps">
                  <li>לחץ על כפתור השיתוף <span className="ios-share">⬆️</span> בתחתית הדפדפן (Safari)</li>
                  <li>גלול ובחר <b>"הוסף למסך הבית"</b> (Add to Home Screen)</li>
                  <li>לחץ <b>"הוסף"</b> בפינה הימנית העליונה</li>
                </ol>
              </>
            ) : (
              <>
                <h2>הוספה למסך הבית (אנדרואיד)</h2>
                <ol className="install-steps">
                  <li>לחץ על שלוש הנקודות <b>⋮</b> בפינה הימנית העליונה של הדפדפן</li>
                  <li>בחר <b>"התקן אפליקציה"</b> או <b>"הוסף למסך הבית"</b></li>
                  <li>אשר את ההתקנה</li>
                </ol>
              </>
            )}
            <button className="btn" onClick={() => setOpen(false)}>הבנתי</button>
          </div>
        </div>
      )}
    </>
  )
}
