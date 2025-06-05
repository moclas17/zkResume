"use client"

import { useState, useEffect } from "react"
import { walletSession } from "../lib/wallet-session"

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [currentNetwork, setCurrentNetwork] = useState<"neon" | "iexec" | "unknown">("unknown")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize with current session
    const session = walletSession.getSession()
    setAddress(session.address)
    setIsConnected(session.isConnected)
    setChainId(session.chainId)
    setCurrentNetwork(session.currentNetwork)

    // Set up listeners for wallet events
    walletSession.setListeners({
      onAccountChange: (newAddress) => {
        setAddress(newAddress)
        setIsConnected(!!newAddress)
      },
      onChainChange: (newChainId) => {
        setChainId(newChainId)
        const session = walletSession.getSession()
        setCurrentNetwork(session.currentNetwork)
      },
      onConnect: (newAddress) => {
        setAddress(newAddress)
        setIsConnected(true)
        setError(null)
      },
      onDisconnect: () => {
        setAddress(null)
        setIsConnected(false)
        setChainId(null)
        setCurrentNetwork("unknown")
      },
    })
  }, [])

  const connect = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const address = await walletSession.connect()
      return address
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    walletSession.disconnect()
  }

  const switchToNeon = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await walletSession.switchToNeon()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const switchToIExec = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await walletSession.switchToIExec()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    address,
    isConnected,
    chainId,
    currentNetwork,
    isLoading,
    error,
    connect,
    disconnect,
    switchToNeon,
    switchToIExec,
  }
}
