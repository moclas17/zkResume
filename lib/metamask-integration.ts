"use client"

import { ethers } from "ethers"
import { NEON_DEVNET_CONFIG } from "./nft-contract"

export interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: string | null
  balance: string | null
  isCorrectNetwork: boolean
}

export class MetaMaskManager {
  private provider: ethers.providers.Web3Provider | null = null
  private signer: ethers.Signer | null = null

  constructor() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum)
      this.setupEventListeners()
    }
  }

  /**
   * Checks if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }

  /**
   * Connects to MetaMask wallet
   */
  async connectWallet(): Promise<WalletState> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.")
      }

      // Get signer
      this.signer = this.provider!.getSigner()
      const address = await this.signer.getAddress()

      // Get current network
      const network = await this.provider!.getNetwork()
      const chainId = `0x${network.chainId.toString(16)}`

      // Get balance
      const balance = await this.provider!.getBalance(address)
      const balanceInEth = ethers.utils.formatEther(balance)

      // Check if on correct network
      const isCorrectNetwork = chainId === NEON_DEVNET_CONFIG.chainId

      return {
        isConnected: true,
        address,
        chainId,
        balance: balanceInEth,
        isCorrectNetwork,
      }
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error)
      throw new Error(error.message || "Failed to connect to MetaMask")
    }
  }

  /**
   * Disconnects from MetaMask (clears local state)
   */
  async disconnectWallet(): Promise<void> {
    this.signer = null
    // Note: MetaMask doesn't have a programmatic disconnect method
    // This just clears our local state
  }

  /**
   * Gets current wallet state
   */
  async getWalletState(): Promise<WalletState> {
    if (!this.isMetaMaskInstalled()) {
      return {
        isConnected: false,
        address: null,
        chainId: null,
        balance: null,
        isCorrectNetwork: false,
      }
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })

      if (accounts.length === 0) {
        return {
          isConnected: false,
          address: null,
          chainId: null,
          balance: null,
          isCorrectNetwork: false,
        }
      }

      const address = accounts[0]
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      const balance = await this.provider!.getBalance(address)
      const balanceInEth = ethers.utils.formatEther(balance)
      const isCorrectNetwork = chainId === NEON_DEVNET_CONFIG.chainId

      return {
        isConnected: true,
        address,
        chainId,
        balance: balanceInEth,
        isCorrectNetwork,
      }
    } catch (error) {
      console.error("Error getting wallet state:", error)
      return {
        isConnected: false,
        address: null,
        chainId: null,
        balance: null,
        isCorrectNetwork: false,
      }
    }
  }

  /**
   * Switches to Neon DevNet
   */
  async switchToNeonDevNet(): Promise<void> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error("MetaMask is not installed")
    }

    try {
      // Try to switch to Neon devnet
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NEON_DEVNET_CONFIG.chainId }],
      })
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [NEON_DEVNET_CONFIG],
        })
      } else {
        throw switchError
      }
    }
  }

  /**
   * Gets the current signer
   */
  getSigner(): ethers.Signer | null {
    return this.signer
  }

  /**
   * Gets the provider
   */
  getProvider(): ethers.providers.Web3Provider | null {
    return this.provider
  }

  /**
   * Sets up event listeners for MetaMask events
   */
  private setupEventListeners(): void {
    if (!window.ethereum) return

    // Account changed
    window.ethereum.on("accountsChanged", (accounts: string[]) => {
      console.log("Accounts changed:", accounts)
      if (accounts.length === 0) {
        // User disconnected
        this.signer = null
      } else {
        // User switched accounts
        this.signer = this.provider!.getSigner()
      }
      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent("walletAccountChanged", { detail: accounts }))
    })

    // Chain changed
    window.ethereum.on("chainChanged", (chainId: string) => {
      console.log("Chain changed:", chainId)
      // Reload the page to reset state
      window.location.reload()
    })

    // Connection changed
    window.ethereum.on("connect", (connectInfo: any) => {
      console.log("MetaMask connected:", connectInfo)
      window.dispatchEvent(new CustomEvent("walletConnected", { detail: connectInfo }))
    })

    // Disconnection
    window.ethereum.on("disconnect", (error: any) => {
      console.log("MetaMask disconnected:", error)
      this.signer = null
      window.dispatchEvent(new CustomEvent("walletDisconnected", { detail: error }))
    })
  }

  /**
   * Signs a message with the current account
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error("No signer available. Please connect your wallet first.")
    }

    try {
      const signature = await this.signer.signMessage(message)
      return signature
    } catch (error) {
      console.error("Error signing message:", error)
      throw error
    }
  }

  /**
   * Gets transaction history (simplified)
   */
  async getTransactionHistory(address: string, limit = 10): Promise<any[]> {
    if (!this.provider) return []

    try {
      // Get latest block
      const latestBlock = await this.provider.getBlockNumber()
      const transactions = []

      // Look through recent blocks for transactions from this address
      for (let i = 0; i < Math.min(limit, 100); i++) {
        const blockNumber = latestBlock - i
        const block = await this.provider.getBlockWithTransactions(blockNumber)

        const userTxs = block.transactions.filter(
          (tx) => tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase(),
        )

        transactions.push(...userTxs)

        if (transactions.length >= limit) break
      }

      return transactions.slice(0, limit)
    } catch (error) {
      console.error("Error getting transaction history:", error)
      return []
    }
  }
}

// Global instance
export const metaMaskManager = new MetaMaskManager()

// Type declarations
declare global {
  interface Window {
    ethereum?: any
  }
}
