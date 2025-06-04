"use client"

import { useState, useEffect, useCallback } from "react"
import { metaMaskManager, type WalletState } from "../lib/metamask-integration"

export function useMetaMask() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
    isCorrectNetwork: false,
  })

  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check initial wallet state
  useEffect(() => {
    checkWalletState()
  }, [])

  // Set up event listeners
  useEffect(() => {
    const handleAccountChanged = (event: CustomEvent) => {
      console.log("Account changed event:", event.detail)
      checkWalletState()
    }

    const handleWalletConnected = (event: CustomEvent) => {
      console.log("Wallet connected event:", event.detail)
      checkWalletState()
    }

    const handleWalletDisconnected = (event: CustomEvent) => {
      console.log("Wallet disconnected event:", event.detail)
      setWalletState({
        isConnected: false,
        address: null,
        chainId: null,
        balance: null,
        isCorrectNetwork: false,
      })
    }

    window.addEventListener("walletAccountChanged", handleAccountChanged as EventListener)
    window.addEventListener("walletConnected", handleWalletConnected as EventListener)
    window.addEventListener("walletDisconnected", handleWalletDisconnected as EventListener)

    return () => {
      window.removeEventListener("walletAccountChanged", handleAccountChanged as EventListener)
      window.removeEventListener("walletConnected", handleWalletConnected as EventListener)
      window.removeEventListener("walletDisconnected", handleWalletDisconnected as EventListener)
    }
  }, [])

  const checkWalletState = useCallback(async () => {
    try {
      const state = await metaMaskManager.getWalletState()
      setWalletState(state)
    } catch (err: any) {
      console.error("Error checking wallet state:", err)
      setError(err.message)
    }
  }, [])

  const connectWallet = useCallback(async () => {
    if (!metaMaskManager.isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return false
    }

    try {
      setIsConnecting(true)
      setError(null)

      const state = await metaMaskManager.connectWallet()
      setWalletState(state)

      return true
    } catch (err: any) {
      console.error("Error connecting wallet:", err)
      setError(err.message)
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(async () => {
    try {
      await metaMaskManager.disconnectWallet()
      setWalletState({
        isConnected: false,
        address: null,
        chainId: null,
        balance: null,
        isCorrectNetwork: false,
      })
    } catch (err: any) {
      console.error("Error disconnecting wallet:", err)
      setError(err.message)
    }
  }, [])

  const switchToNeonDevNet = useCallback(async () => {
    try {
      setError(null)
      await metaMaskManager.switchToNeonDevNet()
      // State will be updated via event listener
      return true
    } catch (err: any) {
      console.error("Error switching network:", err)
      setError(err.message)
      return false
    }
  }, [])

  const signMessage = useCallback(async (message: string) => {
    try {
      setError(null)
      const signature = await metaMaskManager.signMessage(message)
      return signature
    } catch (err: any) {
      console.error("Error signing message:", err)
      setError(err.message)
      throw err
    }
  }, [])

  const refreshBalance = useCallback(async () => {
    if (walletState.address) {
      await checkWalletState()
    }
  }, [walletState.address, checkWalletState])

  return {
    // State
    walletState,
    isConnecting,
    error,
    isMetaMaskInstalled: metaMaskManager.isMetaMaskInstalled(),

    // Actions
    connectWallet,
    disconnectWallet,
    switchToNeonDevNet,
    signMessage,
    refreshBalance,
    clearError: () => setError(null),

    // Computed values
    isConnected: walletState.isConnected,
    address: walletState.address,
    balance: walletState.balance,
    chainId: walletState.chainId,
    isCorrectNetwork: walletState.isCorrectNetwork,
  }
}
