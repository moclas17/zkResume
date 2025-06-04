"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, ExternalLink, Share2, Plus, Calendar, Hash, Wallet } from "lucide-react"
import Link from "next/link"
import { useNFTMinting } from "../../hooks/use-nft-minting"
import { useMetaMask } from "../../hooks/use-metamask"
import { MetaMaskWallet } from "../../components/metamask-wallet"

interface Snapshot {
  id: string
  hash: string
  industry: string
  date: string
  status: "minted" | "pending"
  nftId?: string
}

export default function DashboardPage() {
  const [snapshots] = useState<Snapshot[]>([
    {
      id: "1",
      hash: "0x7f9a2b8c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c",
      industry: "Technology",
      date: "2024-01-15",
      status: "minted",
      nftId: "neon_12345",
    },
    {
      id: "2",
      hash: "0x8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
      industry: "Finance",
      date: "2024-01-10",
      status: "minted",
      nftId: "neon_12344",
    },
  ])

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [nftTokens, setNftTokens] = useState<any[]>([])

  const { getUserNFTs, getTokenMetadata } = useNFTMinting()
  const { isConnected, address } = useMetaMask()

  useEffect(() => {
    const loadUserNFTs = async () => {
      if (!isConnected || !address) return

      try {
        const tokens = await getUserNFTs(address)

        // Get metadata for each token
        const tokensWithMetadata = await Promise.all(
          tokens.map(async (token) => {
            const metadata = await getTokenMetadata(token.tokenId)
            return { ...token, metadata }
          }),
        )

        setNftTokens(tokensWithMetadata)
      } catch (error) {
        console.error("Error loading NFTs:", error)
      }
    }

    loadUserNFTs()
  }, [getUserNFTs, getTokenMetadata, isConnected, address])

  const copyShareLink = async (snapshotId: string, nftId: string) => {
    const shareLink = `https://zkresume-snapshots.com/verify/${nftId}`
    await navigator.clipboard.writeText(shareLink)
    setCopiedId(snapshotId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const viewOnBlockchain = (nftId: string) => {
    window.open(`https://devnet.neonscan.org/token/0xc21c311b7fabeb355e8be695be0ad2e1b89b8c7b?a=${nftId}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">zkResume Snapshots</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/upload">
                <Plus className="w-4 h-4 mr-2" />
                New Snapshot
              </Link>
            </Button>
            <div className="w-8 h-8 bg-gray-300 rounded-full" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Snapshots</h1>
          <p className="text-gray-600">Manage your anonymous professional credentials</p>
        </div>

        {/* Wallet Connection */}
        {!isConnected && (
          <div className="mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Wallet className="w-8 h-8 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">Connect your wallet to view NFTs</h3>
                    <p className="text-blue-700 mb-4">
                      Connect MetaMask to view your minted NFT credentials and manage your snapshots.
                    </p>
                    <MetaMaskWallet compact={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Snapshots</p>
                  <p className="text-2xl font-bold text-gray-900">{snapshots.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Hash className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Minted NFTs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isConnected ? nftTokens.length : snapshots.filter((s) => s.status === "minted").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Industries</p>
                  <p className="text-2xl font-bold text-gray-900">{new Set(snapshots.map((s) => s.industry)).size}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real NFTs from blockchain */}
        {isConnected && nftTokens.length > 0 && (
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>Your NFT Credentials (On-Chain)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nftTokens.map((token) => (
                  <div key={token.tokenId} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">NFT Minted</Badge>
                          <Badge variant="outline">
                            {token.metadata?.attributes?.find((attr: any) => attr.trait_type === "Industry")?.value ||
                              "Unknown"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Token ID: #{token.tokenId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => viewOnBlockchain(token.tokenId)}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on NeonScan
                        </Button>
                      </div>
                    </div>

                    {token.metadata && (
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">NFT Metadata:</p>
                          <div className="bg-gray-50 p-3 rounded text-xs">
                            <p>
                              <strong>Name:</strong> {token.metadata.name}
                            </p>
                            <p>
                              <strong>Description:</strong> {token.metadata.description}
                            </p>
                            {token.metadata.attributes && (
                              <div className="mt-2">
                                <strong>Attributes:</strong>
                                <ul className="ml-4 mt-1">
                                  {token.metadata.attributes.map((attr: any, index: number) => (
                                    <li key={index}>
                                      {attr.trait_type}: {attr.value}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Snapshots List */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Demo Snapshots</CardTitle>
          </CardHeader>
          <CardContent>
            {snapshots.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hash className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Snapshots yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first Snapshot to generate an anonymous professional credential
                </p>
                <Button asChild>
                  <Link href="/upload">
                    <Plus className="w-4 h-4 mr-2" />
                    Create my first Snapshot
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {snapshots.map((snapshot) => (
                  <div key={snapshot.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={snapshot.status === "minted" ? "default" : "secondary"}>
                            {snapshot.status === "minted" ? "NFT Minted" : "Pending"}
                          </Badge>
                          <Badge variant="outline">{snapshot.industry}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Created on{" "}
                          {new Date(snapshot.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      {snapshot.status === "minted" && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyShareLink(snapshot.id, snapshot.nftId!)}
                          >
                            {copiedId === snapshot.id ? (
                              <>Copied!</>
                            ) : (
                              <>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share credential
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => viewOnBlockchain(snapshot.nftId!)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on blockchain
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Snapshot hash:</p>
                        <code className="text-xs bg-gray-100 p-2 rounded block font-mono break-all">
                          {snapshot.hash}
                        </code>
                      </div>
                      {snapshot.nftId && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">NFT ID:</p>
                          <code className="text-xs bg-green-50 text-green-800 p-2 rounded block font-mono">
                            {snapshot.nftId}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
