"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

// This would typically come from an API call
const mockQuestions = [
  {
    id: 1,
    title: "2024 US Presidential Election",
    description: "Who will win the 2024 US Presidential Election?",
    options: [
      { id: 1, text: "Democratic Party", votes: 480 },
      { id: 2, text: "Republican Party", votes: 450 },
      { id: 3, text: "Other", votes: 70 },
    ],
    totalVotes: 1000,
  },
  {
    id: 2,
    title: "Next iPhone Release Date",
    description: "When will Apple release the next iPhone?",
    options: [
      { id: 1, text: "September 2023", votes: 750 },
      { id: 2, text: "October 2023", votes: 200 },
      { id: 3, text: "November 2023", votes: 50 },
    ],
    totalVotes: 1000,
  },
  {
    id: 3,
    title: "Cryptocurrency Market Cap",
    description: "Will the total cryptocurrency market cap exceed $3 trillion in 2023?",
    options: [
      { id: 1, text: "Yes", votes: 600 },
      { id: 2, text: "No", votes: 400 },
    ],
    totalVotes: 1000,
  },
  {
    id: 4,
    title: "AI Breakthrough",
    description: "Will there be a major AI breakthrough in natural language understanding in 2023?",
    options: [
      { id: 1, text: "Yes", votes: 800 },
      { id: 2, text: "No", votes: 200 },
    ],
    totalVotes: 1000,
  },
]

type Question = {
  id: number
  title: string
  description: string
  options: { id: number; text: string; votes: number }[]
  totalVotes: number
}

export default function VotePage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [userVotes, setUserVotes] = useState<{ [key: number]: number }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // This would typically be an API call
    const fetchQuestions = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setQuestions(mockQuestions)
        setLoading(false)
      } catch (err) {
        setError("Failed to load questions. Please try again later.")
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleVote = (questionId: number, optionId: number) => {
    setUserVotes((prevVotes) => ({
      ...prevVotes,
      [questionId]: optionId,
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // This would typically be an API call to submit votes
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state to reflect submitted votes
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) => ({
          ...q,
          options: q.options.map((o) => ({
            ...o,
            votes: o.votes + (userVotes[q.id] === o.id ? 1 : 0),
          })),
          totalVotes: q.totalVotes + (userVotes[q.id] ? 1 : 0),
        })),
      )

      // Clear user votes after submission
      setUserVotes({})
      setSubmitting(false)
    } catch (err) {
      setError("Failed to submit votes. Please try again.")
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vote on Predictions</h1>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {questions.map((question) => (
          <Card key={question.id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-lg">{question.title}</CardTitle>
              <CardDescription>{question.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                {question.options.map((option) => {
                  const percentage = (option.votes / question.totalVotes) * 100
                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span>{option.text}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <Button
                        onClick={() => handleVote(question.id, option.id)}
                        variant={userVotes[question.id] === option.id ? "default" : "outline"}
                        size="sm"
                        className="w-full mt-1"
                      >
                        {userVotes[question.id] === option.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">Total votes: {question.totalVotes}</p>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button onClick={handleSubmit} disabled={submitting || Object.keys(userVotes).length === 0}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting Votes...
            </>
          ) : (
            "Submit Votes"
          )}
        </Button>
      </div>
    </div>
  )
}

