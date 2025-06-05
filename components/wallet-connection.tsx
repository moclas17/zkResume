"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, Copy, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletConnectionProps {
  onConnectionChange?: (connected: boolean, address?: string) => void
  showBalance?: boolean
  compact?: boolean
}

export function WalletConnection({ onConnectionChange, showBalance = true, compact = false }: WalletConnectionProps) {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const NEON_DEVNET_CHAIN_ID = "0xe9ac0ce"

  // Update connection state and notify parent
  const updateConnectionState = (connected: boolean, walletAddress?: string) => {
    setIsConnected(connected)
    setAddress(walletAddress || null)

    // Always notify parent component of connection state change
    onConnectionChange?.(connected, walletAddress)

    console.log("Connection state updated:", { connected, address: walletAddress })
  }

  // Check if MetaMask is installed and get initial state
  useEffect(() => {
    const checkMetaMask = async () => {
      // Make sure we're running in the browser
      if (typeof window === "undefined") return

      const isInstalled = window.ethereum !== undefined
      setIsMetaMaskInstalled(isInstalled)

      if (isInstalled) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts && accounts.length > 0) {
            const walletAddress = accounts[0]

            // Get chain ID
            const chainId = await window.ethereum.request({ method: "eth_chainId" })
            setChainId(chainId)

            // Get balance
            if (showBalance) {
              refreshBalance(walletAddress)
            }

            // Update connection state and notify parent
            updateConnectionState(true, walletAddress)

            console.log("Wallet already connected:", walletAddress)
          } else {
            // Not connected
            updateConnectionState(false)
            console.log("Wallet not connected")
          }
        } catch (err) {
          console.error("Error checking MetaMask:", err)
          updateConnectionState(false)
        }
      } else {
        updateConnectionState(false)
      }
    }

    // Small delay to ensure window.ethereum is available
    setTimeout(checkMetaMask, 100)

    // Set up event listeners
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
      window.ethereum.on("disconnect", handleDisconnect)
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
        window.ethereum.removeListener("disconnect", handleDisconnect)
      }
    }
  }, [onConnectionChange])

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      updateConnectionState(false)
      setBalance(null)
      console.log("Account disconnected")
    } else {
      // Account changed
      const newAddress = accounts[0]
      updateConnectionState(true, newAddress)
      refreshBalance(newAddress)
      console.log("Account changed to:", newAddress)
    }
  }

  // Handle chain changes
  const handleChainChanged = (newChainId: string) => {
    setChainId(newChainId)
    console.log("Chain changed to:", newChainId)
    // Refresh page on chain change as recommended by MetaMask
    window.location.reload()
  }

  // Handle disconnect
  const handleDisconnect = () => {
    updateConnectionState(false)
    setBalance(null)
    console.log("Wallet disconnected")
  }

  // Connect to MetaMask
  const connectWallet = async () => {
    // Make sure we're running in the browser
    if (typeof window === "undefined") return

    if (!window.ethereum) {
      setError("MetaMask is not installed")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      console.log("Requesting accounts...")

      // Force MetaMask to show the popup
      const accounts = await window.ethereum
        .request({
          method: "eth_requestAccounts",
          params: [],
        })
        .catch((err: any) => {
          console.error("Request accounts error:", err)
          throw err
        })

      console.log("Accounts received:", accounts)

      if (accounts && accounts.length > 0) {
        const walletAddress = accounts[0]

        // Get chain ID
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(chainId)

        // Get balance
        if (showBalance) {
          refreshBalance(walletAddress)
        }

        // Update connection state and notify parent
        updateConnectionState(true, walletAddress)

        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask",
        })
      } else {
        throw new Error("No accounts returned from MetaMask")
      }
    } catch (err: any) {
      console.error("Error connecting to MetaMask:", err)

      // Handle user rejected request error
      if (err.code === 4001) {
        setError("You rejected the connection request")
        toast({
          title: "Connection Rejected",
          description: "You rejected the connection request",
          variant: "destructive",
        })
      } else {
        setError(err.message || "Failed to connect to MetaMask")
        toast({
          title: "Connection Failed",
          description: err.message || "Failed to connect to MetaMask",
          variant: "destructive",
        })
      }

      updateConnectionState(false)
    } finally {
      setIsConnecting(false)
    }
  }

  // Refresh balance
  const refreshBalance = async (walletAddress: string) => {
    if (typeof window === "undefined" || !window.ethereum) return

    setIsRefreshing(true)
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [walletAddress, "latest"],
      })

      // Convert from wei to ETH/NEON
      const ethBalance = (Number.parseInt(balance, 16) / 1e18).toFixed(4)
      setBalance(ethBalance)
    } catch (err) {
      console.error("Error getting balance:", err)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Switch to Neon DevNet
  const switchToNeonDevNet = async () => {
    if (typeof window === "undefined" || !window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NEON_DEVNET_CHAIN_ID }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: NEON_DEVNET_CHAIN_ID,
                chainName: "Neon EVM DevNet",
                nativeCurrency: {
                  name: "NEON",
                  symbol: "NEON",
                  decimals: 18,
                },
                rpcUrls: ["https://devnet.neonevm.org"],
                blockExplorerUrls: ["https://devnet.neonscan.org/"],
              },
            ],
          })
        } catch (addError: any) {
          setError(addError.message || "Failed to add Neon DevNet")
        }
      } else {
        setError(switchError.message || "Failed to switch to Neon DevNet")
      }
    }
  }

  // Copy address to clipboard
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

  // Open MetaMask website
  const openMetaMask = () => {
    window.open("https://metamask.io/download/", "_blank")
  }

  // Truncate address for display
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Check if connected to Neon DevNet
  const isNeonDevNet = chainId?.toLowerCase() === NEON_DEVNET_CHAIN_ID

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
      <Card className={`${isNeonDevNet ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
        <CardContent className={`space-y-3 p-4 ${compact ? "pt-3 pb-3" : ""}`}>
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isNeonDevNet ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              )}
              <span className={isNeonDevNet ? "text-sm text-green-800" : "text-sm text-orange-800"}>
                {isNeonDevNet ? "Connected to Neon" : "Wrong Network"}
              </span>
            </div>
            <Badge variant={isNeonDevNet ? "default" : "outline"} className="text-xs">
              {isNeonDevNet ? "Neon DevNet" : "Switch Network"}
            </Badge>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Address</span>
              <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                {copied ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
            <code className="text-xs bg-white p-2 rounded border block font-mono">{truncateAddress(address)}</code>
          </div>

          {/* Balance */}
          {showBalance && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Balance</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshBalance(address)}
                  disabled={isRefreshing}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="text-xs font-mono">
                  {balance ? `${balance} ${isNeonDevNet ? "NEON" : "ETH"}` : "Loading..."}
                </span>
              </div>
            </div>
          )}

          {/* Network Switch */}
          {!isNeonDevNet && (
            <Button onClick={switchToNeonDevNet} size="sm" className="w-full mt-2">
              Switch to Neon DevNet
            </Button>
          )}
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
                  <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-5 text-xs mt-1 p-0">
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => {
              console.log("Connect button clicked")
              connectWallet()
            }}
            disabled={isConnecting}
            className="w-full"
            size="sm"
          >
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
        </div>
      </CardContent>
    </Card>
  )
}
