'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

const insuranceTypes = [
  "Auto Insurance",
  "Home Insurance",
  "Life Insurance",
  "Health Insurance",
  "Business Insurance",
  "Travel Insurance",
]

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  contact_number: z.string().min(10, {
    message: 'Contact number must be at least 10 digits.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  appointmentDate: z.date({
    required_error: 'Please select a date for the appointment.',
  }),
  appointmentTime: z.string({
    required_error: 'Please select a time for the appointment.',
  }),
  insuranceType: z.string({
    required_error: 'Please select an insurance type.',
  }),
})

interface InsuranceQuoteFormProps {
  title: string
}

export function InsuranceQuoteForm({ title }: InsuranceQuoteFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contact_number: '',
      email: '',
      appointmentTime: '',
      insuranceType: '',
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setFormStatus(null)
    try {
      const response = await fetch('/api/submit-insurance-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit form')
      }

      const responseData = await response.json()
      setFormStatus({ message: responseData.message || "Your appointment has been successfully scheduled. We'll contact you soon to confirm the details.", type: 'success' })
      form.reset()
    } catch (error) {
      setFormStatus({ message: error instanceof Error ? error.message : "There was an error submitting the form. Please try again.", type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="my-2 p-4 bg-white shadow-md rounded-lg border border-[#1E2C6B]/10">
      <h2 className="text-3xl font-bold mb-6 text-[#1E2C6B]">{title}</h2>
      
      {formStatus && (
        <div className={`mb-4 p-4 rounded ${formStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {formStatus.message}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E2C6B]">Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="border-[#1E2C6B]/20 focus:border-[#1E2C6B]" />
                </FormControl>
                <FormMessage className="text-[#C4A484]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E2C6B]">Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} className="border-[#1E2C6B]/20 focus:border-[#1E2C6B]" />
                </FormControl>
                <FormMessage className="text-[#C4A484]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E2C6B]">Email</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe@example.com" {...field} className="border-[#1E2C6B]/20 focus:border-[#1E2C6B]" />
                </FormControl>
                <FormMessage className="text-[#C4A484]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insuranceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E2C6B]">Insurance Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-[#1E2C6B]/20 focus:border-[#1E2C6B]">
                      <SelectValue placeholder="Select an insurance type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {insuranceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[#C4A484]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="appointmentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-[#1E2C6B]">Appointment Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal border-[#1E2C6B]/20 focus:border-[#1E2C6B]",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="border-[#1E2C6B]/20"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-[#C4A484]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="appointmentTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E2C6B]">Appointment Time</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-[#1E2C6B]/20 focus:border-[#1E2C6B]">
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[#C4A484]" />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full bg-[#1E2C6B] hover:bg-[#1E2C6B]/90" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </Form>
    </div>
  )
}