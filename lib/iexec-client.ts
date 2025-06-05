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
  if (!window.ethereum) {
    throw new Error("MetaMask not found")
  }

  try {
    // Request accounts to ensure we have permission
    await window.ethereum.request({ method: "eth_requestAccounts" })

    // Create iExec client with MetaMask
    const iexec = new IExec({
      ethProvider: window.ethereum,
    })

    // Check if we're on the correct network
    const network = await iexec.network.getNetwork()
    if (network.chainId !== IEXEC_BELLECOUR_CONFIG.chainId) {
      console.log("Switching to iExec Bellecour network...")
      await switchToIExecBellecour()

      // Recreate client after network switch
      return new IExec({
        ethProvider: window.ethereum,
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
  // Real iExec addresses for Bellecour testnet
  // These are public apps and workerpools available on iExec
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
  if (!window.ethereum) {
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
            decimals: 18,
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
  if (!window.ethereum) {
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
      await addIExecBellecourNetwork()
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
      nRLC: balance.stake * Math.pow(10, 9), // Convert to nRLC
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
