'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Loader2, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { io, Socket } from 'socket.io-client'
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



const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL as string;

export default function BotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (isOpen && !socketRef.current) {
      if (!SOCKET_URL) {
        setError("This service is not available for this version of the website.")
        return;
      }

      console.log('Attempting to connect to WebSocket...')
      
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true
      })

      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket', socketRef.current?.id)
        setIsConnected(true)
        setError(null)
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error)
        setIsConnected(false)
        setError(`Connection error: ${error.message}`)
      })

      socketRef.current.on('message', (data: ChatResponse) => {
        console.log('Received message:', data)
        if (data.error) {
          console.error('Message error:', data.error)
          setError(data.error)
        } else {
          addMessage(data.response, 'bot')
        }
        setIsLoading(false)
      })

      socketRef.current.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket:', reason)
        setIsConnected(false)
        if (reason === 'io server disconnect') {
          socketRef.current?.connect()
        }
      })

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error)
        setError(`Socket error: ${error.message}`)
      })
    }

    return () => {
      if (socketRef.current) {
        console.log('Cleaning up WebSocket connection...')
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
    }
  }, [isOpen])

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading || !socketRef.current || !isConnected) return

    setIsLoading(true)
    addMessage(inputMessage, 'user')
    setInputMessage('')

    try {
      socketRef.current.emit('message', { message: inputMessage })
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message')
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
        <div className="bg-background border border-border rounded-lg shadow-xl w-80 sm:w-96 flex flex-col h-[500px] relative overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Wing Heights AI Assistant</h2>
              {isConnected ? (
                <div className="w-2 h-2 rounded-full bg-green-500" title="Connected" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-red-500" title="Disconnected" />
              )}
            </div>
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
                  <p className="whitespace-pre-wrap">{message.text}</p>
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
                disabled={isLoading || !isConnected || !SOCKET_URL}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !inputMessage.trim() || !isConnected || !SOCKET_URL}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>

          {error && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
              <Alert variant="destructive" className="max-w-[90%]">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
