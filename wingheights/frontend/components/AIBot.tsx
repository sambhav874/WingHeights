'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatResponse {
  response: string
  requires_input: boolean
  token_count: number
  max_tokens: number
  error?: string
}

const INITIAL_MESSAGE: Message = {
  id: 1,
  text: "Hello! I'm an AI assistant for Wing Heights Ghana Insurance. How can I help you today?",
  sender: 'bot',
  timestamp: new Date()
}

const API_ENDPOINT = 'https://dev.srv618269.hstgr.cloud/chat/ask'

export default function BotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      text,
      sender,
      timestamp: new Date()
    }])
  }

  const sendMessageToAPI = async (message: string): Promise<ChatResponse> => {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, chat_history: messages.map(m => `${m.sender}: ${m.text}`) })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data: ChatResponse = await response.json()
      console.log('API Response:', data)
      
      if (!data.response) {
        throw new Error('Empty response from API')
      }

      setError(null)
      return data
    } catch (error) {
      console.error('Error in sendMessageToAPI:', error)
      setError('Failed to connect to the chat service')
      throw error
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    setIsLoading(true)
    addMessage(inputMessage, 'user')
    setInputMessage('')

    try {
      const chatResponse = await sendMessageToAPI(inputMessage)
      addMessage(chatResponse.response, 'bot')
    } catch (error) {
      addMessage('Sorry, I couldn\'t process your request. Please try again later.', 'bot')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      {isOpen && (
        <div className="bg-background border border-border rounded-lg shadow-xl w-80 sm:w-96 flex flex-col h-[500px]">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Wing Heights AI Assistant</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex mb-4",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-4 py-2",
                    message.sender === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p>{message.text}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {format(message.timestamp, 'HH:mm')}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="border-t border-border p-4">
            <div className="flex items-center space-x-2">
              <Textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 min-h-[60px] max-h-[120px]"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
