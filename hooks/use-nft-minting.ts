"use client"

import { useState, useCallback } from "react"
import { ethers } from "ethers"
import { createNftContract, switchToNeonDevNet } from "../lib/nft-contract"
import { useToast } from "@/hooks/use-toast"

export function useNftMinting() {
  const [mintingStatus, setMintingStatus] = useState<"idle" | "minting" | "completed" | "error">("idle")
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null)
  const [mintingError, setMintingError] = useState<string | null>(null)
  const [isNftMinted, setIsNftMinted] = useState(false)

  const { toast } = useToast()

  const mintNft = useCallback(
    async (snapshotHash: string, taskId: string, metadata: any) => {
      setMintingStatus("minting")
      setMintingError(null)
      setIsNftMinted(false)

      try {
        if (typeof window === "undefined" || !window.ethereum) {
          throw new Error("MetaMask is not installed or not available.")
        }

        // Ensure MetaMask is connected and on Neon DevNet
        await switchToNeonDevNet()

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const userAddress = await signer.getAddress()

        const contract = createNftContract(signer)

        // Prepare metadata URI (e.g., upload to IPFS)
        // For now, we'll use a placeholder or a simple JSON string
        const tokenUri = `https://example.com/nft-metadata/${taskId}.json` // Placeholder URI

        console.log("Attempting to mint NFT with hash:", snapshotHash)
        console.log("To address:", userAddress)
        console.log("Token URI:", tokenUri)

        // Call the mint function on your contract
        // Assuming your contract has a mint function that takes (to, hash, uri)
        const tx = await contract.mint(userAddress, snapshotHash, tokenUri)
        console.log("Minting transaction sent:", tx.hash)

        toast({
          title: "Minting NFT...",
          description: `Transaction sent: ${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`,
          duration: 5000,
        })

        const receipt = await tx.wait()
        console.log("Minting transaction confirmed:", receipt)

        // Extract token ID from the event (assuming your mint function emits Transfer or similar)
        let tokenId: string | null = null
        if (receipt && receipt.logs) {
          const transferEvent = receipt.logs.find((log: any) => contract.interface.parseLog(log)?.name === "Transfer")
          if (transferEvent) {
            tokenId = contract.interface.parseLog(transferEvent)?.args[2].toString()
          }
        }

        setMintedTokenId(tokenId)
        setIsNftMinted(true)
        setMintingStatus("completed")

        toast({
          title: "NFT Minted Successfully!",
          description: `Token ID: ${tokenId || "N/A"}. View on NeonScan.`,
          duration: 7000,
        })

        return tokenId
      } catch (err: any) {
        console.error("Error minting NFT:", err)
        setMintingError(err.message || "Failed to mint NFT")
        setMintingStatus("error")
        toast({
          title: "NFT Minting Failed",
          description: err.message || "An unknown error occurred during minting.",
          variant: "destructive",
          duration: 7000,
        })
        throw err
      }
    },
    [toast],
  )

  return {
    mintingStatus,
    mintedTokenId,
    mintingError,
    isNftMinted,
    mintNft,
  }
}
