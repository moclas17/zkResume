"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, Copy, RefreshCw, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useWallet } from "@/hooks/use-wallet"

interface MetaMaskWalletProps {
  onConnectionChange?: (connected: boolean, address?: string) => void
  showBalance?: boolean
  showNetworkSwitch?: boolean
  compact?: boolean
  redirectToDashboard?: boolean
}

export function MetaMaskWallet({
  onConnectionChange,
  showBalance = true,
  showNetworkSwitch = true,
  compact = false,
  redirectToDashboard = true,
}: MetaMaskWalletProps) {
  const {
    isConnected,
    address,
    chainId,
    isLoading,
    error: walletError,
    connectWallet,
    switchNetwork,
    getBalance,
  } = useWallet()

  const [balance, setBalance] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(walletError)

  const router = useRouter()
  const { toast } = useToast()

  const NEON_DEVNET_CHAIN_ID = "0x335"
  const NEON_DEVNET_CONFIG = {
    chainId: NEON_DEVNET_CHAIN_ID,
    chainName: "Neon EVM DevNet",
    nativeCurrency: {
      name: "NEON",
      symbol: "NEON",
      decimals: 18,
    },
    rpcUrls: ["https://devnet.neonevm.org"],
    blockExplorerUrls: ["https://devnet.neonscan.org/"],
  }

  const isCorrectNetwork = chainId === NEON_DEVNET_CHAIN_ID
  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum

  // Load balance when connected
  useEffect(() => {
    if (isConnected && address) {
      refreshBalance()

      // Notify parent component
      onConnectionChange?.(true, address)
    } else {
      onConnectionChange?.(false)
    }
  }, [isConnected, address])

  // Update error from wallet hook
  useEffect(() => {
    setError(walletError)
  }, [walletError])

  const refreshBalance = async () => {
    if (!isConnected || !address) return

    setIsRefreshing(true)
    try {
      const newBalance = await getBalance()
      setBalance(newBalance)
    } catch (err) {
      console.error("Error refreshing balance:", err)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleConnect = async () => {
    const success = await connectWallet()

    if (success && redirectToDashboard) {
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      })

      // Redirect to dashboard after successful connection
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    }
  }

  const handleSwitchNetwork = async () => {
    await switchNetwork(NEON_DEVNET_CHAIN_ID, NEON_DEVNET_CONFIG)
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const openMetaMask = () => {
    window.open("https://metamask.io/download/", "_blank")
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // MetaMask not installed
  if (!isMetaMaskInstalled) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-orange-600" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-gray-900">MetaMask Required</h3>
            <p className="text-sm text-gray-600">Install MetaMask to connect your wallet and access zkResume</p>
          </div>
          <Button onClick={openMetaMask} className="w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            Install MetaMask
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Not connected
  if (!isConnected) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-gray-900">Connect Your Wallet</h3>
            <p className="text-sm text-gray-600">Connect your MetaMask wallet to access your zkResume account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-2 w-full">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-800">Connection Error</p>
                  <p className="text-xs text-red-700">{error}</p>
                  <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-5 text-xs mt-1 p-0">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleConnect} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Wrong network
  if (showNetworkSwitch && !isCorrectNetwork) {
    return (
      <Card className="border-2 border-yellow-200 bg-yellow-50/50">
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-gray-900">Wrong Network</h3>
            <p className="text-sm text-gray-600">Please switch to Neon DevNet to continue</p>
          </div>
          <Button onClick={handleSwitchNetwork} disabled={isLoading} className="w-full" variant="outline">
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Switching...
              </>
            ) : (
              "Switch to Neon DevNet"
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Connected and correct network
  return (
    <Card className="border-2 border-green-200 bg-green-50/50">
      <CardContent className={`${compact ? "py-4" : "py-6"} space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Wallet Connected</p>
              <Badge variant="secondary" className="text-xs">
                Neon DevNet
              </Badge>
            </div>
          </div>
        </div>

        {!compact && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Address</p>
                <p className="font-mono text-sm">{address && truncateAddress(address)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {showBalance && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Balance</p>
                  <p className="font-semibold">{balance || "0"} NEON</p>
                </div>
                <Button variant="ghost" size="sm" onClick={refreshBalance} disabled={isRefreshing}>
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            )}
          </div>
        )}

        {redirectToDashboard && !compact && (
          <Button onClick={() => router.push("/dashboard")} className="w-full">
            Continue to Dashboard
          </Button>
        )}

        {!compact && (
          <div className="text-center">
            <Button
              variant="link"
              size="sm"
              onClick={() => address && window.open(`https://devnet.neonscan.org/address/${address}`, "_blank")}
              className="text-xs text-gray-500"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View on NeonScan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
