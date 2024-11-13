'use client'

import { useState, useEffect } from 'react'
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import InsuranceQuoteForm from "@/components/unusedComponents/InsuranceQuoteForm"

type Insurance = {
  id: number
  name: string
  description: string
}

export default function HomePage() {
  const [insurances, setInsurances] = useState<Insurance[]>([])

  useEffect(() => {
    const fetchInsurances = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/insurances`)
        const data = await response.json()
        setInsurances(data.data)
      } catch (error) {
        console.error('Error fetching insurances:', error)
      }
    }

    fetchInsurances()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <main>
        <section className="bg-purple-900 text-white py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <h1 className="text-5xl font-bold mb-4">Wing Heights Ghana</h1>
              <p className="text-xl mb-8">Enabling #BetterFutures</p>
            </div>
            <div className="md:w-1/2 relative">
              <Image
                src="/Subject-removebg-preview.png"
                alt="Insurance scenarios illustration"
                width={600}
                height={300}
                className="mb-8"
              />
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-20 bg-white"
            style={{
              borderTopLeftRadius: "50% 100%",
              borderTopRightRadius: "50% 100%",
            }}
          ></div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 flex flex-col md:flex-row">
            <div className="md:w-2/3 pr-8">
              <img src="hollard-ghana_homepage.svg" alt="Hollard Ghana Homepage" />
              <h2 className="text-3xl font-bold mb-4">
                Insuring you, everyone and <span className="text-orange-500">everything you love</span>
              </h2>
              <p className="mb-4">
                Worry less and do more with your insurance policy by your favourite insurance group, Wing Heights Ghana,
                comprised of subsidiaries, Wing Heights Insurance (general insurance) and Wing Heights Life Assurance
                (life insurance).
              </p>
              <p className="mb-4">
                Thinking about taking out a life insurance policy that covers your family in the event of your passing
                is not high on anyone's list of priorities. But it's essential. Hollard has made this and all personal
                and business insurance matters as smooth and simplified as possible; you don't have to think about it
                except to know that it's covered.
              </p>
              <p className="mb-4">
                Worry less and do more with Ghana's trusted insurance company in your corner.
              </p>
              <p className="font-bold">Let's get started.</p>
            </div>

            <div className="md:w-1/3 mt-8 md:mt-0">
              <InsuranceQuoteForm />
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Insurance Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {insurances.map((insurance) => (
                <Card key={insurance.id} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {insurance.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{insurance.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}