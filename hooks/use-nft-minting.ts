"use client"

import { useState, useCallback } from "react"
import { NFTContractManager } from "../lib/nft-contract"

interface MintingStatus {
  status: "idle" | "connecting" | "minting" | "confirming" | "completed" | "error"
  message: string
  txHash?: string
  tokenId?: string
}

export function useNFTMinting() {
  const [mintingStatus, setMintingStatus] = useState<MintingStatus>({
    status: "idle",
    message: "",
  })

  const [error, setError] = useState<string | null>(null)
  const nftManager = new NFTContractManager()

  const mintNFT = useCallback(async (snapshotHash: string, metadata: any) => {
    try {
      setError(null)
      setMintingStatus({
        status: "connecting",
        message: "Connecting to Neon devnet...",
      })

      // Connect to Neon
      await nftManager.connectToNeon()

      setMintingStatus({
        status: "minting",
        message: "Minting your NFT credential...",
      })

      // Mint the NFT
      const tokenId = await nftManager.mintSnapshot(snapshotHash, metadata)

      setMintingStatus({
        status: "completed",
        message: "NFT minted successfully!",
        tokenId,
      })

      return tokenId
    } catch (err: any) {
      console.error("Error minting NFT:", err)
      const errorMessage = err.message || "Error minting NFT"
      setError(errorMessage)
      setMintingStatus({
        status: "error",
        message: errorMessage,
      })
      throw err
    }
  }, [])

  const getUserNFTs = useCallback(async (userAddress: string) => {
    try {
      const tokens = await nftManager.getUserTokens(userAddress)
      return tokens
    } catch (err: any) {
      console.error("Error getting user NFTs:", err)
      return []
    }
  }, [])

  const getTokenMetadata = useCallback(async (tokenId: string) => {
    try {
      const metadata = await nftManager.getTokenMetadata(tokenId)
      return metadata
    } catch (err: any) {
      console.error("Error getting token metadata:", err)
      return null
    }
  }, [])

  const checkNeonConnection = useCallback(async () => {
    try {
      const isConnected = await nftManager.isConnectedToNeon()
      return isConnected
    } catch (err: any) {
      return false
    }
  }, [])

  const resetMinting = useCallback(() => {
    setMintingStatus({
      status: "idle",
      message: "",
    })
    setError(null)
  }, [])

  return {
    mintingStatus,
    error,
    mintNFT,
    getUserNFTs,
    getTokenMetadata,
    checkNeonConnection,
    resetMinting,
    isMinting:
      mintingStatus.status !== "idle" && mintingStatus.status !== "completed" && mintingStatus.status !== "error",
  }
}
