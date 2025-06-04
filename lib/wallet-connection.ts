"use client"

import { createIExecClient } from "./iexec-client"

export class WalletManager {
  private iexec: any

  constructor() {
    if (typeof window !== "undefined") {
      this.iexec = createIExecClient()
    }
  }

  /**
   * Connects user's wallet
   */
  async connectWallet(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed")
      }

      // Request connection to MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Get user's address
      const address = await this.iexec.wallet.getAddress()

      // Verify we have enough RLC for operations
      const balance = await this.iexec.account.checkBalance(address)

      if (balance.RLC < 1) {
        console.warn("Low RLC balance. RLC is needed to execute tasks on iExec.")
      }

      return address
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
    }
  }

  /**
   * Checks if wallet is connected
   */
  async isWalletConnected(): Promise<boolean> {
    try {
      if (!window.ethereum) return false

      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      return accounts.length > 0
    } catch (error) {
      return false
    }
  }

  /**
   * Gets user's RLC balance
   */
  async getRLCBalance(): Promise<number> {
    try {
      const address = await this.iexec.wallet.getAddress()
      const balance = await this.iexec.account.checkBalance(address)
      return balance.RLC
    } catch (error) {
      console.error("Error getting RLC balance:", error)
      return 0
    }
  }
}

// Declare types for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
