import { IExec } from "iexec"

// iExec Bellecour network configuration
const IEXEC_BELLECOUR_CONFIG = {
  chainId: 134, // iExec Bellecour chain ID
  rpcUrl: "https://bellecour.iex.ec",
  name: "iExec Bellecour",
}

// Create iExec client specifically for Bellecour network
export const createIExecClient = () => {
  // Always use iExec Bellecour network for confidential computing
  const iexec = new IExec({
    ethProvider: IEXEC_BELLECOUR_CONFIG.rpcUrl,
    chainId: IEXEC_BELLECOUR_CONFIG.chainId,
  })

  return iexec
}

// Create iExec client with user's wallet for signing (but on Bellecour network)
export const createIExecClientWithWallet = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed or not available in this environment.")
  }

  try {
    // Request accounts to ensure we have permission
    await window.ethereum.request({ method: "eth_requestAccounts" })

    // Create a custom provider that uses user's wallet for signing
    // but connects to iExec Bellecour for RPC calls
    const customProvider = {
      // For account and signing methods, use the user's wallet
      request: async (args: any) => {
        if (
          args.method === "eth_accounts" ||
          args.method === "eth_requestAccounts" ||
          args.method.startsWith("eth_sign") ||
          args.method === "personal_sign" ||
          args.method === "eth_sendTransaction" ||
          args.method === "wallet_switchEthereumChain" || // Allow wallet to switch chain
          args.method === "wallet_addEthereumChain" // Allow wallet to add chain
        ) {
          return window.ethereum.request(args)
        }

        // For other RPC calls, use iExec Bellecour
        const response = await fetch(IEXEC_BELLECOUR_CONFIG.rpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: args.id || 1,
            method: args.method,
            params: args.params,
          }),
        })

        const data = await response.json()
        if (data.error) {
          throw new Error(data.error.message)
        }
        return data.result
      },
    }

    // Create iExec client with custom provider
    const iexec = new IExec({
      ethProvider: customProvider,
      chainId: IEXEC_BELLECOUR_CONFIG.chainId,
    })

    // Check if we're on the correct network for iExec operations
    // This is important for RLC balance checks and task submissions
    const network = await iexec.network.getNetwork()
    if (network.chainId !== IEXEC_BELLECOUR_CONFIG.chainId) {
      console.log("Attempting to switch to iExec Bellecour network...")
      await switchToIExecBellecour() // This will prompt the user to switch/add network

      // Recreate client after network switch to ensure it's on the correct chain context
      return new IExec({
        ethProvider: customProvider, // Use the custom provider again
        chainId: IEXEC_BELLECOUR_CONFIG.chainId,
      })
    }

    return iexec
  } catch (error) {
    console.error("Error creating iExec client:", error)
    throw error
  }
}

// iExec application and workerpool addresses on Bellecour
export const IEXEC_CONFIG = {
  // These are public apps and workerpools available on iExec Bellecour testnet
  app: "0x2b0e6b6a1d2e1c671809ce8c08a21f0db097a17a", // iExec Confidential Computing app
  workerpool: "0x5c288a5a69a7c5b42d9dd2d31bbabc1f5c9b0e0e", // iExec SGX workerpool
  category: 0, // Computation category (0 is the default)
  params: {
    iexec_developer_logger: true,
    iexec_result_encryption: true,
    iexec_result_storage_provider: "ipfs",
    iexec_input_files: [], // No input files needed
    iexec_args: "process-experience", // Command for the app
  },
}

// Helper function to check if user needs to add iExec Bellecour network
export const addIExecBellecourNetwork = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found")
  }

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${IEXEC_BELLECOUR_CONFIG.chainId.toString(16)}`, // 0x86
          chainName: IEXEC_BELLECOUR_CONFIG.name,
          rpcUrls: [IEXEC_BELLECOUR_CONFIG.rpcUrl],
          nativeCurrency: {
            name: "RLC",
            symbol: "RLC",
            decimals: 18, // RLC has 18 decimals
          },
          blockExplorerUrls: ["https://blockscout-bellecour.iex.ec"],
        },
      ],
    })
    return true
  } catch (error: any) {
    console.error("Error adding iExec Bellecour network:", error)
    throw error
  }
}

// Helper function to switch to iExec Bellecour network
export const switchToIExecBellecour = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found")
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${IEXEC_BELLECOUR_CONFIG.chainId.toString(16)}` }],
    })
    return true
  } catch (error: any) {
    if (error.code === 4902) {
      // Network not added, add it first
      console.log("iExec Bellecour network not found, adding it...")
      await addIExecBellecourNetwork()
      // After adding, try switching again
      return switchToIExecBellecour()
    } else {
      console.error("Error switching to iExec Bellecour network:", error)
      throw error
    }
  }
}

// Check RLC balance
export const checkRLCBalance = async (iexec: any) => {
  try {
    const userAddress = await iexec.wallet.getAddress()
    const balance = await iexec.account.checkBalance(userAddress)
    return {
      rlc: balance.stake,
      nRLC: balance.stake * Math.pow(10, 9), // Convert to nRLC (if needed for display)
    }
  } catch (error) {
    console.error("Error checking RLC balance:", error)
    throw error
  }
}

// Get iExec explorer URL for a task
export const getTaskExplorerUrl = (taskId: string) => {
  return `https://explorer.iex.ec/bellecour/task/${taskId}`
}
