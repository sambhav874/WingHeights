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
import ReactMarkdown from 'react-markdown'

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
          className="h-12 w-12 rounded-full shadow-lg opacity-50 cursor-not-allowed hover:scale-105 transition-all duration-300"
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
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-xl hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </Button>
    )
  }

  if (!connected) {
    return (
      <div className="fixed bottom-4 right-4 w-[90vw] md:w-[440px] lg:w-[500px]">
        <Card className="h-[80vh] md:h-[700px] lg:h-[700px] flex items-center justify-center shadow-2xl border-opacity-50 backdrop-blur-sm bg-background/95">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Connecting to chat server...</p>
              {error && (
                <p className="text-destructive text-sm text-center font-medium bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-[90vw] md:w-[440px] lg:w-[500px] z-50">
      <Card className="h-[60vh] md:h-[500px] lg:h-[600px] sm:h-[900px] xs:h-[1200px] flex flex-col overflow-hidden shadow-2xl border-opacity-50 backdrop-blur-sm bg-background/95">
        <CardHeader className="px-4 py-3 border-b space-y-1 bg-gradient-to-r from-background to-background/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 md:h-9 md:w-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage src="/bot-avatar.png" alt="ADA" className="object-cover" />
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm md:text-base font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">ADA Insurance Assistant</CardTitle>
                <CardDescription className="text-[10px] md:text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Online
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleChat} 
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-end gap-3 p-1 group transition-opacity duration-200",
                    message.role === 'user' && "justify-end"
                  )}
                >
                  {message.role === 'bot' && (
                    <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/20">
                      <AvatarImage src="/bot-avatar.png" alt="ADA" className="object-cover" />
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl max-w-[85%] break-words shadow-md transition-all duration-200",
                      message.role === 'user' 
                        ? "bg-gradient-to-r from-primary to-primary/90 text-white rounded-br-none" 
                        : "bg-muted/50 backdrop-blur-sm rounded-bl-none hover:bg-muted/70"
                    )}
                  >
                    <div className={cn(
                      "text-sm md:text-base prose prose-sm max-w-none",
                      message.role === 'user' ? "text-white" : "dark:prose-invert"
                    )}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <span className={cn(
                      "text-[9px] md:text-[11px] opacity-0 group-hover:opacity-70 transition-opacity duration-300 mt-1 inline-block",
                      message.role === 'user' ? "text-white/70" : "text-foreground/70"
                    )}>
                      {format(new Date(message.timestamp), 'HH:mm')}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/20">
                      <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80">
                        <User className="h-5 w-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground pl-11">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span className="text-xs font-medium">ADA is typing...</span>
                </div>
              )}
              {error && (
                <div className="mx-4 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator className="shrink-0" />

          <div className="p-4 bg-gradient-to-b from-background/50 to-background">
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
                  className="flex-grow text-sm shadow-sm border-opacity-50 focus:border-primary/50 transition-all duration-200"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="shrink-0 h-10 w-10 rounded-full shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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