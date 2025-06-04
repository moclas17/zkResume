"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Lock, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useConfidentialProcessing } from "../../hooks/use-confidential-processing"
import type { ExperienceData } from "../../types/experience"
import { MetaMaskWallet } from "../../components/metamask-wallet"

export default function UploadPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    industry: "",
    description: "",
    allowValidation: false,
  })
  const { status, result, error, processExperience, resetProcessing, isProcessing } = useConfidentialProcessing()

  const [walletConnected, setWalletConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string>("")

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isFormValid = formData.role && formData.experience && formData.industry && formData.description

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) return

    try {
      const experienceData: ExperienceData = {
        role: formData.role,
        experience: formData.experience,
        industry: formData.industry,
        description: formData.description,
        allowValidation: formData.allowValidation,
      }

      const result = await processExperience(experienceData)

      // Redirect to processing page with real data and form data for NFT metadata
      const params = new URLSearchParams({
        taskId: result.taskId,
        hash: result.hash,
        role: formData.role,
        experience: formData.experience,
        industry: formData.industry,
        allowValidation: formData.allowValidation.toString(),
      })

      router.push(`/processing?${params.toString()}`)
    } catch (err) {
      console.error("Error processing experience:", err)
      // Error is handled in the hook
    }
  }

  const canSubmit = isFormValid && walletConnected && !isProcessing

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">zkResume Snapshots</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Share your work experience</h1>
          <p className="text-gray-600">
            Enter the details of your professional experience. This information will be processed privately and not
            stored.
          </p>
        </div>

        {/* MetaMask wallet connection */}
        <div className="mb-6">
          <MetaMaskWallet
            onConnectionChange={(connected, address) => {
              setWalletConnected(connected)
              setUserAddress(address || "")
            }}
            showBalance={true}
            showNetworkSwitch={true}
            compact={false}
          />
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Professional information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Role performed *</Label>
                <Input
                  id="role"
                  placeholder="e.g. Senior Developer, Marketing Manager, Data Analyst"
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of experience *</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g. 5"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select onValueChange={(value) => handleInputChange("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="human-resources">Human Resources</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Brief description of achievements *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your main achievements and responsibilities in this role..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  maxLength={280}
                  rows={4}
                  required
                />
                <div className="text-sm text-gray-500 text-right">{formData.description.length}/280 characters</div>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                <Checkbox
                  id="validation"
                  checked={formData.allowValidation}
                  onCheckedChange={(checked) => handleInputChange("allowValidation", checked as boolean)}
                />
                <Label htmlFor="validation" className="text-sm">
                  My former employer can validate this information (optional)
                </Label>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800 mb-1">Security indicator</p>
                    <p className="text-green-700">
                      Your data is not stored and is processed in a confidential environment. Only a mathematical proof
                      of your experience is generated without revealing personal information.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-800 mb-1">Processing error</p>
                      <p className="text-red-700">{error}</p>
                      <Button variant="outline" size="sm" onClick={resetProcessing} className="mt-2">
                        Try again
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{status.message}</span>
                      <span className="text-blue-600">{status.progress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${status.progress}%` }}
                      />
                    </div>
                    {status.taskId && (
                      <p className="text-xs text-blue-700">
                        iExec task ID: <code className="bg-blue-100 px-1 rounded">{status.taskId}</code>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full py-6 text-lg" disabled={!canSubmit}>
                {!walletConnected ? (
                  "Connect MetaMask first"
                ) : isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    {status.message}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Process privately with iExec
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
