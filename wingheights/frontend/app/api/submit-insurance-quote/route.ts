import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { format } from 'date-fns'
import ical from 'ical-generator'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { name, contact_number, email, appointmentDate, appointmentTime, insuranceType } = await request.json()

    const parsedDate = new Date(appointmentDate)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ message: 'Invalid date' }, { status: 400 })
    }

    const formattedDate = format(parsedDate, 'yyyy-MM-dd')
    const csvLine = `${name},${contact_number},${email},${formattedDate},${appointmentTime},${insuranceType}\n`

    const filePath = path.join(process.cwd(), 'insurance_quotes.csv')

    try {
      await fs.access(filePath)
    } catch {
      await fs.writeFile(filePath, 'Name,Contact Number,Email,Appointment Date,Appointment Time,Insurance Type\n')
    }

    await fs.appendFile(filePath, csvLine)

    const startDate = new Date(`${formattedDate}T${appointmentTime}:00`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

    const calendar = ical({
      prodId: '//Wing Heights//Insurance Quote//EN',
      events: [
        {
          start: startDate,
          end: endDate,
          summary: `Insurance Quote Appointment - ${insuranceType}`,
          description: `Appointment with ${name}\nContact: ${contact_number}\nEmail: ${email}\nInsurance Type: ${insuranceType}`,
          location: 'Wing Heights Ghana',
          url: 'https://wingheights.com'
        }
      ]
    })

    const iCalString = calendar.toString()

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.SUPPORT_EMAIL,
      subject: `New Insurance Quote Appointment - ${insuranceType}`,
      text: `New appointment scheduled with ${name} on ${formattedDate} at ${appointmentTime} for ${insuranceType} insurance.`,
      html: `
        <h1>New Insurance Quote Appointment</h1>
        <p>An appointment has been scheduled with the following details:</p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Contact Number:</strong> ${contact_number}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Time:</strong> ${appointmentTime}</li>
          <li><strong>Insurance Type:</strong> ${insuranceType}</li>
        </ul>
        <p>This event has been added to your calendar.</p>
      `,
      icalEvent: {
        filename: 'appointment.ics',
        method: 'REQUEST',
        content: iCalString
      }
    })

    return NextResponse.json({ message: 'Thanks for the query . We will soon contact you .' }, { status: 200 })
  } catch (error) {
    console.error('Error processing form submission:', error)
    return NextResponse.json({ message: 'Error processing form submission' }, { status: 500 })
  }
}