import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon, Clock } from "lucide-react"

const insuranceTypes = [
  "Health Insurance",
  "Life Insurance", 
  "Auto Insurance",
  "Home Insurance",
  "Travel Insurance",
  "Business Insurance"
]

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30"
]

interface FormProps {
  onSubmit: (details: {
    name: string
    email: string
    contact_number: string
    insuranceType: string
    date: string
    time: string
  }) => void
}

export function Form({ onSubmit }: FormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    insuranceType: '',
    date: '',
    time: ''
  })

  const [date, setDate] = useState<Date>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      date: date ? format(date, 'yyyy-MM-dd') : ''
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="name" className="text-xs font-medium">
            Full Name
          </Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-xs font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-xs font-medium">
            Contact Number
          </Label>
          <Input
            id="phone"
            placeholder="+1 (555) 000-0000"
            value={formData.contact_number}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">
            Insurance Type
          </Label>
          <Select
            value={formData.insuranceType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, insuranceType: value }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select Insurance Type" />
            </SelectTrigger>
            <SelectContent>
              {insuranceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium">
            Appointment Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full mt-1.5 justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => 
                  date < new Date() || 
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="text-xs font-medium">
            Appointment Time
          </Label>
          <Select
            value={formData.time}
            onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select Time">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{formData.time || "Select time slot"}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full mt-6">
        Book Appointment
      </Button>
    </form>
  )
}