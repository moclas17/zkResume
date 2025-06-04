"use client"

import { ethers } from "ethers"

// Neon devnet configuration
export const NEON_DEVNET_CONFIG = {
  chainId: "0xE9AC0CE", // 245022638 in hex
  chainName: "Neon EVM DevNet",
  nativeCurrency: {
    name: "NEON",
    symbol: "NEON",
    decimals: 18,
  },
  rpcUrls: ["https://devnet.neonevm.org"],
  blockExplorerUrls: ["https://devnet.neonscan.org"],
}

// Your deployed contract address
export const NFT_CONTRACT_ADDRESS = "0xc21c311b7fabeb355e8be695be0ad2e1b89b8c7b"

// Basic ERC721 ABI for minting and viewing
export const NFT_CONTRACT_ABI = [
  // Mint function
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function safeMint(address to, string memory uri) public returns (uint256)",

  // Standard ERC721 functions
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]

export class NFTContractManager {
  private contract: ethers.Contract | null = null
  private provider: ethers.providers.Web3Provider | null = null
  private signer: ethers.Signer | null = null

  constructor() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum)
    }
  }

  /**
   * Connects to Neon devnet and initializes contract
   */
  async connectToNeon(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    try {
      // Switch to Neon devnet
      await this.switchToNeonDevnet()

      // Get signer
      this.signer = this.provider!.getSigner()

      // Initialize contract
      this.contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, this.signer)

      console.log("Connected to Neon devnet and contract initialized")
    } catch (error) {
      console.error("Error connecting to Neon:", error)
      throw error
    }
  }

  /**
   * Switches MetaMask to Neon devnet
   */
  private async switchToNeonDevnet(): Promise<void> {
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
   * Mints an NFT with snapshot data
   */
  async mintSnapshot(snapshotHash: string, metadata: any): Promise<string> {
    if (!this.contract || !this.signer) {
      await this.connectToNeon()
    }

    try {
      const userAddress = await this.signer!.getAddress()

      // Create metadata JSON
      const tokenMetadata = {
        name: `zkResume Snapshot #${Date.now()}`,
        description: "Anonymous professional experience credential generated with confidential computing",
        image: "https://zkresume-snapshots.com/snapshot-image.png",
        attributes: [
          {
            trait_type: "Industry",
            value: metadata.industry,
          },
          {
            trait_type: "Experience Level",
            value: `${metadata.experience} years`,
          },
          {
            trait_type: "Snapshot Hash",
            value: snapshotHash,
          },
          {
            trait_type: "Generated",
            value: new Date().toISOString(),
          },
          {
            trait_type: "Validation Allowed",
            value: metadata.allowValidation ? "Yes" : "No",
          },
        ],
        external_url: `https://zkresume-snapshots.com/verify/${snapshotHash}`,
        background_color: "1E40AF",
      }

      // For demo purposes, we'll use a simple JSON string as tokenURI
      // In production, you'd upload this to IPFS
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(tokenMetadata))}`

      console.log("Minting NFT with metadata:", tokenMetadata)

      // Try different mint function names that might exist in your contract
      let tx: ethers.ContractTransaction
      try {
        // Try safeMint first
        tx = await this.contract!.safeMint(userAddress, tokenURI)
      } catch (error) {
        // Fallback to mint
        tx = await this.contract!.mint(userAddress, tokenURI)
      }

      console.log("Transaction sent:", tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)

      // Extract token ID from Transfer event
      const transferEvent = receipt.events?.find((event: any) => event.event === "Transfer")
      const tokenId = transferEvent?.args?.tokenId?.toString()

      if (!tokenId) {
        throw new Error("Could not extract token ID from transaction")
      }

      return tokenId
    } catch (error) {
      console.error("Error minting NFT:", error)
      throw error
    }
  }

  /**
   * Gets user's NFT tokens
   */
  async getUserTokens(userAddress: string): Promise<any[]> {
    if (!this.contract) {
      await this.connectToNeon()
    }

    try {
      const balance = await this.contract!.balanceOf(userAddress)
      const tokens = []

      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await this.contract!.tokenOfOwnerByIndex(userAddress, i)
        const tokenURI = await this.contract!.tokenURI(tokenId)

        tokens.push({
          tokenId: tokenId.toString(),
          tokenURI,
          contractAddress: NFT_CONTRACT_ADDRESS,
        })
      }

      return tokens
    } catch (error) {
      console.error("Error getting user tokens:", error)
      return []
    }
  }

  /**
   * Gets token metadata
   */
  async getTokenMetadata(tokenId: string): Promise<any> {
    if (!this.contract) {
      await this.connectToNeon()
    }

    try {
      const tokenURI = await this.contract!.tokenURI(tokenId)

      // Handle data URI
      if (tokenURI.startsWith("data:application/json;base64,")) {
        const base64Data = tokenURI.split(",")[1]
        const jsonString = atob(base64Data)
        return JSON.parse(jsonString)
      }

      // Handle HTTP URI
      if (tokenURI.startsWith("http")) {
        const response = await fetch(tokenURI)
        return await response.json()
      }

      return { tokenURI }
    } catch (error) {
      console.error("Error getting token metadata:", error)
      return null
    }
  }

  /**
   * Checks if user is connected to Neon devnet
   */
  async isConnectedToNeon(): Promise<boolean> {
    if (!window.ethereum) return false

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" })
      return chainId === NEON_DEVNET_CONFIG.chainId
    } catch (error) {
      return false
    }
  }
}
