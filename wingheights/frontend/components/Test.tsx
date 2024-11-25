"use client"

import { useState, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send, Bot, User, MessageSquare, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Form } from "./AppointmentForm"
import { format } from "date-fns"

interface Message {
  role: 'user' | 'bot'
  content: string
  timestamp: string
}

interface AppointmentDetails {
  name: string
  email: string
  contact_number: string  
  insuranceType: string
  date: string
  time: string
}

interface SocketResponse {
  response: string
  showForm: boolean
  context?: any
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // If no socket URL is provided, return disabled state with message
  if (!process.env.NEXT_PUBLIC_SOCKET_URL) {
    return (
      <div className="fixed bottom-4 right-4 group">
        <div className="absolute bottom-16 right-0 hidden group-hover:block w-48 p-2 text-sm text-center text-white bg-black/75 backdrop-blur rounded-lg">
          The bot is not in service for now
        </div>
        <Button
          disabled
          className="h-12 w-12 rounded-full shadow-lg opacity-50 cursor-not-allowed"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isOpen) return

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server')
      setConnected(true)
      setError(null)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      setError('Failed to connect to chat server')
      setConnected(false)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setConnected(false)
    })

    newSocket.on('session_created', (data: { session_id: string }) => {
      console.log('Session created:', data.session_id)
      setSessionId(data.session_id)
      addMessage('bot', 'Hello! I\'m ADA, your insurance assistant. I\'ll help you book an appointment with our insurance experts. Would you like to proceed?')
    })

    newSocket.on('response', (data: SocketResponse) => {
      addMessage('bot', data.response)
      if (data.showForm) {
        setShowForm(true)
      }
      setLoading(false)
    })

    newSocket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message)
      setError(data.message)
      setLoading(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [isOpen])

  const addMessage = (role: 'user' | 'bot', content: string) => {
    setMessages(prev => [...prev, {
      role,
      content,
      timestamp: new Date().toISOString()
    }])
  }

  const handleSendMessage = () => {
    if (!input.trim() || !socket || !sessionId || loading) return

    const message = input.trim()
    setInput('')
    setLoading(true)
    setError(null)

    socket.emit('message', {
      session_id: sessionId,
      message: message
    })

    addMessage('user', message)
  }

  const handleFormSubmit = (details: AppointmentDetails) => {
    if (!socket || !sessionId) return

    setLoading(true)
    setError(null)
    
    socket.emit('submit_appointment', {
      session_id: sessionId,
      appointment_details: details
    })

    setShowForm(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleChat = () => {
    setIsOpen(prev => !prev)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  if (!connected) {
    return (
      <div className="fixed bottom-4 right-4 w-[90vw] md:w-[440px] lg:w-[500px]">
        <Card className="h-[80vh] md:h-[700px] lg:h-[700px] flex items-center justify-center shadow-lg">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Connecting to chat server...</p>
              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-[90vw] md:w-[440px] lg:w-[500px] z-50">
      <Card className="h-[60vh] md:h-[500px] lg:h-[600px] sm:h-[900px] xs:h-[1200px] flex flex-col overflow-hidden shadow-lg">
        <CardHeader className="px-4 py-3 border-b space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 md:h-8 md:w-8">
                <AvatarImage src="/bot-avatar.png" alt="ADA" />
                <AvatarFallback>
                  <Bot className="h-4 w-4 md:h-5 md:w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm md:text-base font-semibold">ADA Insurance Assistant</CardTitle>
                <CardDescription className="text-[10px] md:text-xs">Online • Ready to help</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-end gap-2 group",
                    message.role === 'user' && "justify-end"
                  )}
                >
                  {message.role === 'bot' && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src="/bot-avatar.png" alt="ADA" />
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "px-3 py-2 rounded-2xl max-w-[80%] break-words",
                      message.role === 'user' 
                        ? "bg-primary text-primary-foreground rounded-br-none" 
                        : "bg-muted rounded-bl-none"
                    )}
                  >
                    <p className="text-xs md:text-sm">{message.content}</p>
                    <span className="text-[8px] md:text-[10px] opacity-0 group-hover:opacity-60 transition-opacity">
                      {format(new Date(message.timestamp), 'HH:mm')}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-primary">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs">ADA is typing...</span>
                </div>
              )}
              {error && (
                <div className="mx-4 p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator className="shrink-0" />

          <div className="p-3 bg-background">
            {showForm ? (
              <ScrollArea className="h-[250px] pr-4">
                <Form onSubmit={handleFormSubmit} />
              </ScrollArea>
            ) : (
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-grow text-sm"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="shrink-0 h-9 w-9"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}