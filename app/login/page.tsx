"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Wallet, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { isMetaMaskInstalled, connectMetaMask, isMetaMaskConnected, formatAddress } from "@/lib/metamask-utils"

export default function LoginPage() {
  const [hasMetaMask, setHasMetaMask] = useState<boolean | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check MetaMask status on component mount
  useEffect(() => {
    const checkMetaMask = async () => {
      // Check if MetaMask is installed
      const installed = isMetaMaskInstalled()
      setHasMetaMask(installed)

      if (installed) {
        // Check if already connected
        const connected = await isMetaMaskConnected()
        setIsConnected(connected)

        if (connected) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          setAddress(accounts[0])
        }
      }
    }

    // Small delay to ensure window is fully loaded
    setTimeout(checkMetaMask, 300)
  }, [])

  // Handle MetaMask connection
  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      console.log("Attempting to connect to MetaMask...")
      const account = await connectMetaMask()

      if (account) {
        console.log("Connected successfully:", account)
        setIsConnected(true)
        setAddress(account)

        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask",
        })

        // Redirect to dashboard after successful connection
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        throw new Error("No account selected")
      }
    } catch (err: any) {
      console.error("Connection error:", err)

      // Handle user rejected request error
      if (err.code === 4001) {
        setError("You rejected the connection request")
      } else {
        setError(err.message || "Failed to connect to MetaMask")
      }

      toast({
        title: "Connection Failed",
        description: err.message || "Failed to connect to MetaMask",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Open MetaMask website for installation
  const openMetaMaskWebsite = () => {
    window.open("https://metamask.io/download/", "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">zkResume Snapshots</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access your account</h1>
          <p className="text-gray-600">Manage your anonymous professional credentials</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center">Sign in with MetaMask</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasMetaMask === null ? (
              // Loading state
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !hasMetaMask ? (
              // MetaMask not installed
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-gray-900">MetaMask Required</h3>
                  <p className="text-sm text-gray-600">Install MetaMask to connect your wallet and access zkResume</p>
                </div>
                <Button onClick={openMetaMaskWebsite} className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Install MetaMask
                </Button>
              </div>
            ) : !isConnected ? (
              // MetaMask installed but not connected
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-gray-900">Connect Your Wallet</h3>
                  <p className="text-sm text-gray-600">Connect your MetaMask wallet to access your zkResume account</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 w-full">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Connection Error</p>
                        <p className="text-xs text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect MetaMask
                    </>
                  )}
                </Button>
              </div>
            ) : (
              // Connected
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-gray-900">Wallet Connected</h3>
                  <p className="text-sm text-gray-600">
                    Connected as <span className="font-mono">{address && formatAddress(address)}</span>
                  </p>
                </div>

                <Button onClick={() => router.push("/dashboard")} className="w-full">
                  Continue to Dashboard
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600 mt-6">
              <p>
                By connecting your wallet, you agree to our{" "}
                <Link href="#" className="text-blue-600 hover:underline">
                  privacy policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
