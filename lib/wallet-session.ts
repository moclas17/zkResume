"use client"

interface WalletSession {
  address: string | null
  isConnected: boolean
  chainId: number | null
  balance: string | null
  currentNetwork: "neon" | "iexec" | "unknown"
}

interface WalletSessionListeners {
  onAccountChange: (address: string | null) => void
  onChainChange: (chainId: number) => void
  onConnect: (address: string) => void
  onDisconnect: () => void
}

class WalletSessionManager {
  private session: WalletSession = {
    address: null,
    isConnected: false,
    chainId: null,
    balance: null,
    currentNetwork: "unknown",
  }

  private listeners: Partial<WalletSessionListeners> = {}
  private storageKey = "zkresume-wallet-session"

  constructor() {
    if (typeof window !== "undefined") {
      this.loadSession()
      this.setupEventListeners()
    }
  }

  // Load session from localStorage
  private loadSession() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsedSession = JSON.parse(stored)
        this.session = { ...this.session, ...parsedSession }
      }
    } catch (error) {
      console.error("Error loading wallet session:", error)
    }
  }

  // Save session to localStorage
  private saveSession() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.session))
    } catch (error) {
      console.error("Error saving wallet session:", error)
    }
  }

  // Setup MetaMask event listeners
  private setupEventListeners() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        const address = accounts[0] || null
        this.updateSession({ address, isConnected: !!address })
        this.listeners.onAccountChange?.(address)
        if (!address) {
          this.listeners.onDisconnect?.()
        }
      })

      window.ethereum.on("chainChanged", (chainId: string) => {
        const numericChainId = Number.parseInt(chainId, 16)
        const currentNetwork = this.getNetworkFromChainId(numericChainId)
        this.updateSession({ chainId: numericChainId, currentNetwork })
        this.listeners.onChainChange?.(numericChainId)
      })

      window.ethereum.on("connect", (connectInfo: { chainId: string }) => {
        const chainId = Number.parseInt(connectInfo.chainId, 16)
        const currentNetwork = this.getNetworkFromChainId(chainId)
        this.updateSession({ chainId, currentNetwork })
      })

      window.ethereum.on("disconnect", () => {
        this.updateSession({
          address: null,
          isConnected: false,
          chainId: null,
          balance: null,
          currentNetwork: "unknown",
        })
        this.listeners.onDisconnect?.()
      })
    }
  }

  // Determine network from chain ID
  private getNetworkFromChainId(chainId: number): "neon" | "iexec" | "unknown" {
    switch (chainId) {
      case 245022926: // Neon DevNet
        return "neon"
      case 134: // iExec Bellecour
        return "iexec"
      default:
        return "unknown"
    }
  }

  // Update session and save to localStorage
  private updateSession(updates: Partial<WalletSession>) {
    this.session = { ...this.session, ...updates }
    this.saveSession()
  }

  // Connect wallet
  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      const address = accounts[0]
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      const numericChainId = Number.parseInt(chainId, 16)
      const currentNetwork = this.getNetworkFromChainId(numericChainId)

      this.updateSession({
        address,
        isConnected: true,
        chainId: numericChainId,
        currentNetwork,
      })

      this.listeners.onConnect?.(address)
      return address
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      throw error
    }
  }

  // Disconnect wallet
  disconnect() {
    this.updateSession({
      address: null,
      isConnected: false,
      chainId: null,
      balance: null,
      currentNetwork: "unknown",
    })
    localStorage.removeItem(this.storageKey)
    this.listeners.onDisconnect?.()
  }

  // Switch to Neon DevNet
  async switchToNeon(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xE9AC0CE" }], // Neon DevNet
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it first
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xE9AC0CE",
              chainName: "Neon DevNet",
              rpcUrls: ["https://devnet.neonevm.org"],
              nativeCurrency: {
                name: "NEON",
                symbol: "NEON",
                decimals: 18,
              },
              blockExplorerUrls: ["https://devnet.neonscan.org"],
            },
          ],
        })
      } else {
        throw error
      }
    }
  }

  // Switch to iExec Bellecour
  async switchToIExec(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x86" }], // iExec Bellecour
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it first
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x86",
              chainName: "iExec Bellecour",
              rpcUrls: ["https://bellecour.iex.ec"],
              nativeCurrency: {
                name: "RLC",
                symbol: "RLC",
                decimals: 9,
              },
              blockExplorerUrls: ["https://blockscout-bellecour.iex.ec"],
            },
          ],
        })
      } else {
        throw error
      }
    }
  }

  // Get current session
  getSession(): WalletSession {
    return { ...this.session }
  }

  // Set event listeners
  setListeners(listeners: Partial<WalletSessionListeners>) {
    this.listeners = { ...this.listeners, ...listeners }
  }

  // Check if wallet is connected
  isConnected(): boolean {
    return this.session.isConnected && !!this.session.address
  }

  // Get current network
  getCurrentNetwork(): "neon" | "iexec" | "unknown" {
    return this.session.currentNetwork
  }

  // Get wallet address
  getAddress(): string | null {
    return this.session.address
  }
}

// Export singleton instance
export const walletSession = new WalletSessionManager()

// Initialize wallet session
export const initWalletSession = () => {
  // Session is automatically initialized when the class is instantiated
  return walletSession
}
