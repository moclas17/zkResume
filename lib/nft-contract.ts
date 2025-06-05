import { ethers } from "ethers"
import zkResumeSnapshotABI from "../contracts/artifacts/contracts/zkResumeSnapshot.sol/zkResumeSnapshot.json"

// Neon DevNet configuration
export const NEON_DEVNET_CONFIG = {
  chainId: 245022926, // Neon EVM DevNet chain ID
  rpcUrl: "https://devnet.neonevm.org",
  name: "Neon EVM DevNet",
}

// NFT Contract Address on Neon DevNet
export const NFT_CONTRACT_ADDRESS = "0xc21c311b7fabeb355e8be695be0ad2e1b89b8c7b" // Updated contract address

// Function to create a contract instance
export const createNftContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(NFT_CONTRACT_ADDRESS, zkResumeSnapshotABI.abi, signerOrProvider)
}

// Helper function to check if user needs to add Neon DevNet network
export const addNeonDevNetNetwork = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found")
  }

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${NEON_DEVNET_CONFIG.chainId.toString(16)}`,
          chainName: NEON_DEVNET_CONFIG.name,
          rpcUrls: [NEON_DEVNET_CONFIG.rpcUrl],
          nativeCurrency: {
            name: "NEON",
            symbol: "NEON",
            decimals: 18,
          },
          blockExplorerUrls: ["https://devnet.neonscan.org"],
        },
      ],
    })
    return true
  } catch (error: any) {
    console.error("Error adding Neon DevNet network:", error)
    throw error
  }
}

// Helper function to switch to Neon DevNet network
export const switchToNeonDevNet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found")
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${NEON_DEVNET_CONFIG.chainId.toString(16)}` }],
    })
    return true
  } catch (error: any) {
    if (error.code === 4902) {
      // Network not added, add it first
      await addNeonDevNetNetwork()
      return switchToNeonDevNet()
    } else {
      console.error("Error switching to Neon DevNet network:", error)
      throw error
    }
  }
}
