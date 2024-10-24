'use client'
import { MessageSquare, X, Send } from "lucide-react"

import { useState } from "react"

interface Message {
    id: number
    text: string
    sender: 'user' | 'bot'
  }
  

const BotWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Welcome to Wing Heights . How may I assist you?", sender: 'bot' },
    { id: 2, text: "List the insurance options available on this platform .", sender: 'user' },
    { id: 3, text: "Sure , as you say I'll list all the insurance options below .", sender: 'user' },
    { id: 4, text: "Looks amazing .", sender: 'user' }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputMessage,
        sender: 'user'
      }
      setMessages([...messages, newMessage])
      setInputMessage('')
     
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg transition-all hover:bg-primary/90"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
      {isOpen && (
        <div className="bg-background border border-border rounded-lg shadow-xl w-80  sm:w-96 flex flex-col transition-all">
          <div className="flex  justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '400px' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="border-t border-border p-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-muted text-muted-foreground rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Type your message"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground rounded-md p-2 hover:bg-primary/90 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>)
}

export default BotWidget;