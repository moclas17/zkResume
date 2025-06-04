"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { WalletManager } from "../lib/wallet-connection"
import { Wallet, AlertCircle, CheckCircle } from "lucide-react"

interface WalletConnectionProps {
  onConnectionChange?: (connected: boolean, address?: string) => void
}

export function WalletConnection({ onConnectionChange }: WalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>("")
  const [rlcBalance, setRlcBalance] = useState<number>(0)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>("")

  const walletManager = new WalletManager()

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const connected = await walletManager.isWalletConnected()
      if (connected) {
        const userAddress = await walletManager.connectWallet()
        const balance = await walletManager.getRLCBalance()

        setIsConnected(true)
        setAddress(userAddress)
        setRlcBalance(balance)
        onConnectionChange?.(true, userAddress)
      }
    } catch (err: any) {
      console.error("Error checking connection:", err)
    }
  }

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      setError("")

      const userAddress = await walletManager.connectWallet()
      const balance = await walletManager.getRLCBalance()

      setIsConnected(true)
      setAddress(userAddress)
      setRlcBalance(balance)
      onConnectionChange?.(true, userAddress)
    } catch (err: any) {
      setError(err.message || "Error connecting wallet")
      onConnectionChange?.(false)
    } finally {
      setIsConnecting(false)
    }
  }

  if (isConnected) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Wallet connected</p>
                <p className="text-xs text-green-600">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-800">{rlcBalance.toFixed(2)} RLC</p>
              <p className="text-xs text-green-600">{rlcBalance < 0.1 ? "Low balance" : "Sufficient"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">Connect your wallet</h3>
              <p className="text-xs text-orange-600">You need to connect MetaMask to use iExec</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <p className="text-xs">{error}</p>
            </div>
          )}

          <Button onClick={connectWallet} disabled={isConnecting} className="w-full" size="sm">
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

          <div className="text-xs text-orange-600">
            <p>• MetaMask installation required</p>
            <p>• At least 0.1 RLC needed for processing</p>
            <p>• Data is processed privately in SGX</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
