"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wallet, ExternalLink, Copy, RefreshCw, AlertTriangle, CheckCircle, Power, Network, User } from "lucide-react"
import { useMetaMask } from "../hooks/use-metamask"

interface MetaMaskWalletProps {
  onConnectionChange?: (connected: boolean, address?: string) => void
  showBalance?: boolean
  showNetworkSwitch?: boolean
  compact?: boolean
}

export function MetaMaskWallet({
  onConnectionChange,
  showBalance = true,
  showNetworkSwitch = true,
  compact = false,
}: MetaMaskWalletProps) {
  const {
    walletState,
    isConnecting,
    error,
    isMetaMaskInstalled,
    connectWallet,
    disconnectWallet,
    switchToNeonDevNet,
    refreshBalance,
    clearError,
    isConnected,
    address,
    balance,
    isCorrectNetwork,
  } = useMetaMask()

  const [copied, setCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleConnect = async () => {
    const success = await connectWallet()
    if (success && address) {
      onConnectionChange?.(true, address)
    }
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
    onConnectionChange?.(false)
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    await refreshBalance()
    setIsRefreshing(false)
  }

  const openMetaMask = () => {
    window.open("https://metamask.io/download/", "_blank")
  }

  const viewOnExplorer = () => {
    if (address) {
      window.open(`https://devnet.neonscan.org/address/${address}`, "_blank")
    }
  }

  // MetaMask not installed
  if (!isMetaMaskInstalled) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">MetaMask Required</h3>
                <p className="text-xs text-red-600">Please install MetaMask to continue</p>
              </div>
            </div>

            <Button onClick={openMetaMask} className="w-full" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Install MetaMask
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Connected state
  if (isConnected && address) {
    return (
      <Card className={`${isCorrectNetwork ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
        <CardHeader className={compact ? "pb-2" : ""}>
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${isCorrectNetwork ? "text-green-600" : "text-orange-600"}`} />
              <span className={isCorrectNetwork ? "text-green-800" : "text-orange-800"}>
                {isCorrectNetwork ? "Connected to Neon" : "Wrong Network"}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDisconnect} className="h-6 w-6 p-0">
              <Power className="w-3 h-3" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className={`space-y-3 ${compact ? "pt-0" : ""}`}>
          {/* Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Address</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                  {copied ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={viewOnExplorer} className="h-6 w-6 p-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <code className="text-xs bg-white p-2 rounded border block font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </code>
          </div>

          {/* Balance */}
          {showBalance && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Balance</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshBalance}
                  disabled={isRefreshing}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="text-xs font-mono">{balance ? `${Number(balance).toFixed(4)} NEON` : "0 NEON"}</span>
              </div>
            </div>
          )}

          {/* Network Status */}
          {showNetworkSwitch && !isCorrectNetwork && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Network className="w-3 h-3 text-orange-600" />
                  <span className="text-xs font-medium text-orange-800">Switch to Neon DevNet</span>
                </div>
                <Button onClick={switchToNeonDevNet} size="sm" className="w-full">
                  <Network className="w-3 h-3 mr-2" />
                  Switch Network
                </Button>
              </div>
            </>
          )}

          {/* Network Badge */}
          <div className="flex justify-center">
            <Badge variant={isCorrectNetwork ? "default" : "destructive"} className="text-xs">
              {isCorrectNetwork ? "Neon DevNet" : "Wrong Network"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Disconnected state
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Connect MetaMask</h3>
              <p className="text-xs text-blue-600">Connect your wallet to get started</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-800">Connection Error</p>
                  <p className="text-xs text-red-700">{error}</p>
                  <Button variant="ghost" size="sm" onClick={clearError} className="h-5 text-xs mt-1 p-0">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleConnect} disabled={isConnecting} className="w-full" size="sm">
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-3 h-3 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>

          <div className="text-xs text-blue-700 space-y-1">
            <p>• MetaMask browser extension required</p>
            <p>• Will switch to Neon DevNet automatically</p>
            <p>• Your data remains private and secure</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
