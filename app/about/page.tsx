"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-6xl py-8 px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* About Section */}
          <Card className="shadow-xl border-t-4 border-t-primary">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                About PredixArena
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                PredixArena is a platform designed to facilitate engaging discussions and predictions on various topics, including politics, sports, and global events. 
                Our goal is to empower users to share their insights and make informed decisions based on collective intelligence.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Our Mission</h3>
                <p className="text-muted-foreground">
                  To create a transparent and engaging environment where knowledge meets opportunity, enabling users to leverage their insights into meaningful predictions.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-card p-4 rounded-lg border shadow-sm">
                  <h4 className="font-semibold mb-2">For Predictors</h4>
                  <p className="text-sm text-muted-foreground">
                    Make informed predictions on various events and showcase your analytical skills.
                  </p>
                </div>
                
                <div className="bg-card p-4 rounded-lg border shadow-sm">
                  <h4 className="font-semibold mb-2">For Analysts</h4>
                  <p className="text-sm text-muted-foreground">
                    Access comprehensive data and tools to analyze market trends and patterns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Section */}
          <Card className="shadow-xl border-t-4 border-t-primary">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Key Features
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Real-time Updates</h3>
                    <p className="text-muted-foreground">Stay informed with instant updates on event outcomes and market movements.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Advanced Analytics</h3>
                    <p className="text-muted-foreground">Access detailed analytics and insights to make data-driven predictions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Community Driven</h3>
                    <p className="text-muted-foreground">Engage with a diverse community of predictors and analysts.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 