"use client"

import { useState, useCallback } from "react"
import { ConfidentialProcessor, type ProcessingResult } from "../lib/confidential-processing"
import { WalletManager } from "../lib/wallet-connection"
import type { ExperienceData, ProcessingStatus } from "../types/experience"

export function useConfidentialProcessing() {
  const [status, setStatus] = useState<ProcessingStatus>({
    status: "idle",
    message: "",
    progress: 0,
  })

  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processor = new ConfidentialProcessor()
  const walletManager = new WalletManager()

  const processExperience = useCallback(async (experienceData: ExperienceData) => {
    try {
      setError(null)
      setStatus({
        status: "validating",
        message: "Connecting to your wallet...",
        progress: 10,
      })

      // 1. Connect wallet
      const userAddress = await walletManager.connectWallet()
      console.log("Wallet connected:", userAddress)

      setStatus({
        status: "validating",
        message: "Validating information...",
        progress: 20,
      })

      // 2. Validate we have enough RLC
      const balance = await walletManager.getRLCBalance()
      if (balance < 0.1) {
        throw new Error("Insufficient RLC balance. You need at least 0.1 RLC to process data.")
      }

      setStatus({
        status: "encrypting",
        message: "Encrypting data securely...",
        progress: 40,
      })

      // Small pause to show progress
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStatus({
        status: "computing",
        message: "Processing in confidential enclave...",
        progress: 60,
      })

      // 3. Process data confidentially
      const processingResult = await processor.processExperience(experienceData)

      setStatus({
        status: "computing",
        message: "Generating cryptographic proof...",
        progress: 80,
      })

      // Pause to show progress
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setStatus({
        status: "completed",
        message: "Processing completed successfully",
        progress: 100,
        taskId: processingResult.taskId,
      })

      setResult(processingResult)
      return processingResult
    } catch (err: any) {
      console.error("Error in processing:", err)
      setError(err.message || "Unknown error during processing")
      setStatus({
        status: "error",
        message: err.message || "Error during processing",
        progress: 0,
      })
      throw err
    }
  }, [])

  const checkTaskStatus = useCallback(async (taskId: string) => {
    try {
      const taskStatus = await processor.getTaskStatus(taskId)
      return taskStatus
    } catch (err: any) {
      console.error("Error checking task status:", err)
      return "ERROR"
    }
  }, [])

  const resetProcessing = useCallback(() => {
    setStatus({
      status: "idle",
      message: "",
      progress: 0,
    })
    setResult(null)
    setError(null)
  }, [])

  return {
    status,
    result,
    error,
    processExperience,
    checkTaskStatus,
    resetProcessing,
    isProcessing: status.status !== "idle" && status.status !== "completed" && status.status !== "error",
  }
}
