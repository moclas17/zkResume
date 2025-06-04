"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Network, AlertTriangle, CheckCircle } from "lucide-react"
import { NEON_DEVNET_CONFIG } from "../lib/nft-contract"

interface NeonNetworkSwitchProps {
  onNetworkChange?: (connected: boolean) => void
}

export function NeonNetworkSwitch({ onNetworkChange }: NeonNetworkSwitchProps) {
  const [isConnectedToNeon, setIsConnectedToNeon] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isSwitching, setIsSwitching] = useState(false)

  useEffect(() => {
    checkNetwork()
  }, [])

  const checkNetwork = async () => {
    if (!window.ethereum) {
      setIsChecking(false)
      return
    }

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      const connected = chainId === NEON_DEVNET_CONFIG.chainId
      setIsConnectedToNeon(connected)
      onNetworkChange?.(connected)
    } catch (error) {
      console.error("Error checking network:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const switchToNeon = async () => {
    if (!window.ethereum) return

    try {
      setIsSwitching(true)

      // Try to switch to Neon devnet
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NEON_DEVNET_CONFIG.chainId }],
      })

      setIsConnectedToNeon(true)
      onNetworkChange?.(true)
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [NEON_DEVNET_CONFIG],
          })
          setIsConnectedToNeon(true)
          onNetworkChange?.(true)
        } catch (addError) {
          console.error("Error adding Neon network:", addError)
        }
      } else {
        console.error("Error switching network:", switchError)
      }
    } finally {
      setIsSwitching(false)
    }
  }

  if (isChecking) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
            <span className="text-sm text-gray-600">Checking network...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isConnectedToNeon) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Connected to Neon DevNet</p>
                <p className="text-xs text-green-600">Ready to mint NFTs</p>
              </div>
            </div>
            <Badge variant="outline" className="border-green-300 text-green-700">
              Neon EVM
            </Badge>
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
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800">Switch to Neon DevNet</p>
              <p className="text-xs text-orange-600">Required to mint NFT credentials</p>
            </div>
          </div>

          <Button onClick={switchToNeon} disabled={isSwitching} className="w-full" size="sm">
            {isSwitching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Switching...
              </>
            ) : (
              <>
                <Network className="w-4 h-4 mr-2" />
                Switch to Neon DevNet
              </>
            )}
          </Button>

          <div className="text-xs text-orange-600 space-y-1">
            <p>• Chain ID: {Number.parseInt(NEON_DEVNET_CONFIG.chainId, 16)}</p>
            <p>• RPC: {NEON_DEVNET_CONFIG.rpcUrls[0]}</p>
            <p>• Explorer: {NEON_DEVNET_CONFIG.blockExplorerUrls[0]}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
