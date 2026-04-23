import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './App.css'

interface Message {
  role: 'user' | 'ai'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '你好! Hello! I am your Chinese teacher. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const speak = (text: string) => {
    // Extract Chinese characters
    const chineseMatch = text.match(/Chinese: (.*)/)
    const toSpeak = chineseMatch ? chineseMatch[1] : text
    
    const utterance = new SpeechSynthesisUtterance(toSpeak)
    utterance.lang = 'zh-CN'
    window.speechSynthesis.speak(utterance)
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const newMessages = [...messages, { role: 'user', content: input } as Message]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await axios.post(`${apiUrl}/api/chat`, {
        messages: newMessages
      })
      setMessages([...newMessages, { role: 'ai', content: response.data.content }])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages([...newMessages, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1>SinoFlow AI</h1>
      </header>
      <div className="chat-container">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}-message`}>
            {msg.content}
            {msg.role === 'ai' && (
              <button className="play-btn" onClick={() => speak(msg.content)}>
                Play Audio 🔊
              </button>
            )}
          </div>
        ))}
        {loading && <div className="message ai-message">Thinking...</div>}
        <div ref={chatEndRef} />
      </div>
      <div className="controls">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type in English or Chinese..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  )
}

export default App
