/**
 * Utility functions for interacting with MetaMask
 */

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== "undefined" && window.ethereum !== undefined
}

// Check if MetaMask is connected
export const isMetaMaskConnected = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) return false

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" })
    return accounts && accounts.length > 0
  } catch (error) {
    console.error("Error checking MetaMask connection:", error)
    return false
  }
}

// Connect to MetaMask
export const connectMetaMask = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed")
  }

  try {
    // This is the key method that should trigger the MetaMask popup
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    if (accounts && accounts.length > 0) {
      return accounts[0]
    }

    return null
  } catch (error: any) {
    console.error("Error connecting to MetaMask:", error)
    throw error
  }
}

// Get current chain ID
export const getChainId = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) return null

  try {
    return await window.ethereum.request({ method: "eth_chainId" })
  } catch (error) {
    console.error("Error getting chain ID:", error)
    return null
  }
}

// Get account balance
export const getBalance = async (address: string): Promise<string | null> => {
  if (!isMetaMaskInstalled()) return null

  try {
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    })

    // Convert from wei to ETH
    return (Number.parseInt(balance, 16) / 1e18).toFixed(4)
  } catch (error) {
    console.error("Error getting balance:", error)
    return null
  }
}

// Switch to a specific network
export const switchNetwork = async (chainId: string): Promise<boolean> => {
  if (!isMetaMaskInstalled()) return false

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    })
    return true
  } catch (error: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      return false
    }
    throw error
  }
}

// Add a network to MetaMask
export const addNetwork = async (
  chainId: string,
  chainName: string,
  currencyName: string,
  currencySymbol: string,
  decimals: number,
  rpcUrl: string,
  blockExplorerUrl: string,
): Promise<boolean> => {
  if (!isMetaMaskInstalled()) return false

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId,
          chainName,
          nativeCurrency: {
            name: currencyName,
            symbol: currencySymbol,
            decimals,
          },
          rpcUrls: [rpcUrl],
          blockExplorerUrls: [blockExplorerUrl],
        },
      ],
    })
    return true
  } catch (error) {
    console.error("Error adding network:", error)
    return false
  }
}

// Helper to format addresses
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
