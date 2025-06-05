"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useConfidentialProcessing } from "../../hooks/use-confidential-processing"
import { NftMinting } from "../../components/nft-minting"

export default function ProcessingPage() {
  const searchParams = useSearchParams()
  const taskId = searchParams.get("taskId") || ""
  const hash = searchParams.get("hash") || ""

  const [taskStatus, setTaskStatus] = useState<string>("PENDING")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const { checkTaskStatus } = useConfidentialProcessing()

  // Check task status periodically
  useEffect(() => {
    if (!taskId) return

    const checkStatus = async () => {
      try {
        const status = await checkTaskStatus(taskId)
        setTaskStatus(status)
        setIsLoading(false)
      } catch (err: any) {
        console.error("Error checking task status:", err)
        setError(err.message || "Failed to check task status")
        setIsLoading(false)
      }
    }

    // Check immediately
    checkStatus()

    // Then check every 10 seconds
    const interval = setInterval(checkStatus, 10000)

    return () => clearInterval(interval)
  }, [taskId, checkTaskStatus])

  // Status indicator component
  const StatusIndicator = ({ status }: { status: string }) => {
    if (status === "COMPLETED") {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span>Completed</span>
        </div>
      )
    } else if (status === "PENDING" || status === "RUNNING") {
      return (
        <div className="flex items-center gap-2 text-amber-600">
          <Clock className="w-5 h-5" />
          <span>{status === "PENDING" ? "Pending" : "Running"}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Failed</span>
        </div>
      )
    }
  }

  const explorerUrl = `https://explorer.iex.ec/bellecour/task/${taskId}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">zkResume Snapshots</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Processing Experience</h1>
          <p className="text-gray-600">
            Your work experience is being processed confidentially. Once completed, you can mint it as an NFT.
          </p>
        </div>

        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Confidential Processing</span>
              <StatusIndicator status={taskStatus} />
            </CardTitle>
            <CardDescription>
              Your data is being processed in a secure enclave. No one can access the original information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Task ID</span>
                  <span className="font-mono text-gray-900">{taskId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Result Hash</span>
                  <span className="font-mono text-gray-900">{hash}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="font-mono text-gray-900">{taskStatus}</span>
                </div>
              </div>
            </div>

            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on iExec Explorer</span>
            </a>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800 mb-1">Processing error</p>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full">
              {taskStatus === "COMPLETED" ? (
                <NftMinting snapshotHash={hash} taskId={taskId} />
              ) : (
                <Button disabled={isLoading} className="w-full">
                  {isLoading ? "Loading status..." : "Waiting for processing to complete..."}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
