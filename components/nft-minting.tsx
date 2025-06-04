"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Coins, AlertCircle, CheckCircle } from "lucide-react"
import { useNFTMinting } from "../hooks/use-nft-minting"

interface NFTMintingProps {
  snapshotHash: string
  metadata: {
    industry: string
    experience: string
    allowValidation: boolean
    role: string
  }
  onMintComplete?: (tokenId: string) => void
}

export function NFTMinting({ snapshotHash, metadata, onMintComplete }: NFTMintingProps) {
  const { mintingStatus, error, mintNFT, resetMinting, isMinting } = useNFTMinting()
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null)

  const handleMint = async () => {
    try {
      const tokenId = await mintNFT(snapshotHash, metadata)
      setMintedTokenId(tokenId)
      onMintComplete?.(tokenId)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const viewOnNeonScan = (tokenId: string) => {
    window.open(`https://devnet.neonscan.org/token/0xc21c311b7fabeb355e8be695be0ad2e1b89b8c7b?a=${tokenId}`, "_blank")
  }

  if (mintingStatus.status === "completed" && mintedTokenId) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            NFT Minted Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-green-700">
              Your professional credential has been minted as an NFT on Neon EVM.
            </p>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs font-medium text-gray-600 mb-1">Token ID:</p>
              <code className="text-sm font-mono text-green-800">#{mintedTokenId}</code>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => viewOnNeonScan(mintedTokenId)} className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on NeonScan
            </Button>
            <Button variant="outline" size="sm" onClick={resetMinting}>
              Mint Another
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-blue-600" />
          Mint NFT Credential
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm text-blue-800">
            Convert your anonymous snapshot into a verifiable NFT credential on Neon EVM.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white rounded p-2 border">
              <p className="font-medium text-gray-600">Industry</p>
              <p className="text-gray-900">{metadata.industry}</p>
            </div>
            <div className="bg-white rounded p-2 border">
              <p className="font-medium text-gray-600">Experience</p>
              <p className="text-gray-900">{metadata.experience} years</p>
            </div>
          </div>

          <div className="bg-white rounded p-2 border">
            <p className="font-medium text-gray-600 text-xs mb-1">Snapshot Hash</p>
            <code className="text-xs font-mono text-gray-800 break-all">
              {snapshotHash.slice(0, 20)}...{snapshotHash.slice(-10)}
            </code>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Minting Error</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isMinting && (
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">{mintingStatus.message}</p>
                <Badge variant="outline" className="mt-1">
                  {mintingStatus.status}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button onClick={handleMint} disabled={isMinting} className="w-full">
            {isMinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {mintingStatus.message}
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Mint NFT on Neon EVM
              </>
            )}
          </Button>

          <div className="text-xs text-blue-700 space-y-1">
            <p>• Requires connection to Neon devnet</p>
            <p>• Small gas fee in NEON tokens</p>
            <p>• NFT will be viewable on NeonScan</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
