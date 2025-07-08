import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [windowCount, setWindowCount] = useState<number | null>(null)
  const [windows, setWindows] = useState<Array<{ url: string }>>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize with authentication status from sessionStorage
    return sessionStorage.getItem('basicAuthAuthenticated') === 'true'
  })

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleBasicAuth = (username: string, password: string) => {
    const correctUsername = import.meta.env.VITE_BASIC_AUTH_USERNAME
    const correctPassword = import.meta.env.VITE_BASIC_AUTH_PASSWORD
    
    if (username === correctUsername && password === correctPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('basicAuthAuthenticated', 'true')
      return true
    }
    return false
  }

  const handleWindowCountSubmit = (count: number) => {
    setWindowCount(count)
    setWindows(Array(count).fill({ url: '' }))
  }

  const changeWindowCount = (newCount: number) => {
    if (newCount === windowCount || windowCount === null) return
    
    const currentWindows = [...windows]
    
    if (newCount > windowCount) {
      // 窓数を増やす場合、既存の窓は保持して新しい窓を追加
      const additionalWindows = Array(newCount - windowCount).fill({ url: '' })
      setWindows([...currentWindows, ...additionalWindows])
    } else {
      // 窓数を減らす場合、URLが設定されている窓を優先して保持
      const windowsWithUrl = currentWindows.filter(window => window.url !== '')
      const emptyWindows = currentWindows.filter(window => window.url === '')
      
      // 設定済みの窓から必要な数だけ取得
      let selectedWindows = windowsWithUrl.slice(0, newCount)
      
      // 足りない分は空の窓で補完
      if (selectedWindows.length < newCount) {
        const remainingCount = newCount - selectedWindows.length
        selectedWindows = [...selectedWindows, ...emptyWindows.slice(0, remainingCount)]
      }
      
      // まだ足りない場合は空の窓を追加
      while (selectedWindows.length < newCount) {
        selectedWindows.push({ url: '' })
      }
      
      setWindows(selectedWindows)
    }
    
    setWindowCount(newCount)
  }

  const extractSrcFromIframe = (input: string): string => {
    const srcMatch = input.match(/src="([^"]*)"/)
    return srcMatch ? srcMatch[1] : input
  }

  const updateWindow = (index: number, url: string) => {
    const extractedUrl = extractSrcFromIframe(url)
    setWindows(prev => 
      prev.map((window, i) => 
        i === index ? { ...window, url: extractedUrl } : window
      )
    )
  }


  const enterFullscreen = () => {
    document.documentElement.requestFullscreen()
  }

  if (!isAuthenticated) {
    return <BasicAuthForm onAuth={handleBasicAuth} />
  }

  if (windowCount === null) {
    return (
      <div className="container">
        <div className="window-selector">
          <div className="app-description">
            <h1>Multi-Viewer</h1>
            <p>動画やライブ配信を複数窓で同時視聴できるアプリです</p>
            <p>視聴したい窓の数を選択してください</p>
          </div>
          <div className="buttons">
            {[2, 3, 4].map(count => (
              <button
                key={count}
                onClick={() => handleWindowCountSubmit(count)}
                className="count-button"
              >
                {count}窓
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="overlay-controls">
        <select 
          value={windowCount || 2} 
          onChange={(e) => changeWindowCount(parseInt(e.target.value))}
          className="window-count-select"
        >
          <option value={2}>2窓</option>
          <option value={3}>3窓</option>
          <option value={4}>4窓</option>
        </select>
        {!isFullscreen && (
          <button onClick={enterFullscreen} className="fullscreen-button">
            全画面表示
          </button>
        )}
      </div>
      
      <div className={`grid grid-${windowCount}`}>
        {windows.map((window, index) => (
          <div key={index} className="window-container">
            <div className="controls">
              <input
                type="text"
                placeholder="動画のembed URLまたはiframe全体を入力"
                value={window.url}
                onChange={(e) => updateWindow(index, e.target.value)}
                className="url-input"
              />
            </div>
            
            <div className="iframe-container">
              {window.url ? (
                <iframe
                  src={window.url}
                  title={`Video Player ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="placeholder">
                  動画のembed URLを入力してください
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BasicAuthForm({ onAuth }: { onAuth: (username: string, password: string) => boolean }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = onAuth(username, password)
    if (!success) {
      setError('認証に失敗しました。IDとパスワードを確認してください。')
      setPassword('')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Multi-Viewer</h1>
        <p>アクセスするにはログインが必要です</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ユーザーID:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>パスワード:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit">ログイン</button>
        </form>
      </div>
    </div>
  )
}

export default App
