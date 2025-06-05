"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { useNftMinting } from "../hooks/use-nft-minting"
import { NFT_CONTRACT_ADDRESS } from "../lib/nft-contract"
import Link from "next/link"

interface NftMintingProps {
  snapshotHash: string
  taskId: string
  // You can pass additional metadata here if your contract supports it
  // metadata: { industry: string; experience: string; allowValidation: boolean; role: string };
}

export function NftMinting({ snapshotHash, taskId }: NftMintingProps) {
  const { mintingStatus, mintedTokenId, mintingError, isNftMinted, mintNft } = useNftMinting()

  const handleMint = async () => {
    // Placeholder metadata for now. In a real app, this would come from the form or iExec result.
    const metadata = {
      industry: "Technology",
      experience: "5",
      allowValidation: false,
      role: "Developer",
    }
    await mintNft(snapshotHash, taskId, metadata)
  }

  const neonScanUrl = mintedTokenId
    ? `https://devnet.neonscan.org/token/${NFT_CONTRACT_ADDRESS}?a=${mintedTokenId}`
    : `https://devnet.neonscan.org/address/${NFT_CONTRACT_ADDRESS}`

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mintingStatus === "minting" && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
          {mintingStatus === "completed" && <CheckCircle className="w-5 h-5 text-green-600" />}
          {mintingStatus === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
          {mintingStatus === "idle" && <ExternalLink className="w-5 h-5 text-gray-500" />}
          Mint your Snapshot as NFT
        </CardTitle>
        <CardDescription>Turn your anonymous credential into a verifiable NFT on the Neon EVM DevNet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mintingStatus === "completed" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            <p className="font-semibold mb-1">NFT Minted Successfully!</p>
            <p>
              Token ID: <span className="font-mono">{mintedTokenId || "N/A"}</span>
            </p>
            <Link
              href={neonScanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline mt-2"
            >
              View on NeonScan <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        {mintingStatus === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            <p className="font-semibold mb-1">Minting Failed:</p>
            <p>{mintingError}</p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-gray-600">This NFT will represent your cryptographic proof on the blockchain.</p>
          <p className="text-xs text-gray-500">
            Contract Address:{" "}
            <Link
              href={`https://devnet.neonscan.org/address/${NFT_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {NFT_CONTRACT_ADDRESS.substring(0, 6)}...{NFT_CONTRACT_ADDRESS.substring(NFT_CONTRACT_ADDRESS.length - 4)}
            </Link>
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleMint} disabled={mintingStatus === "minting" || isNftMinted} className="w-full">
          {mintingStatus === "minting" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting...
            </>
          ) : isNftMinted ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" /> Minted!
            </>
          ) : (
            "Mint NFT on Neon EVM"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
