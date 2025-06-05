"use client"

import { useState, useCallback } from "react"
import { createIExecClientWithWallet, IEXEC_CONFIG, getTaskExplorerUrl } from "../lib/iexec-client"
import type { ExperienceData } from "../types/experience"

export interface ProcessingResult {
  hash: string
  timestamp: number
  confidentialProof: string
  taskId: string
  explorerUrl: string
}

export interface ProcessingStatus {
  status: "idle" | "validating" | "encrypting" | "computing" | "completed" | "error"
  message: string
  progress: number
  taskId?: string
  explorerUrl?: string
}

export function useConfidentialProcessing() {
  const [status, setStatus] = useState<ProcessingStatus>({
    status: "idle",
    message: "",
    progress: 0,
  })

  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processExperience = useCallback(async (experienceData: ExperienceData): Promise<ProcessingResult> => {
    try {
      setError(null)
      setStatus({
        status: "validating",
        message: "Connecting to iExec network...",
        progress: 5,
      })

      // Create iExec client with user's wallet
      const iexec = await createIExecClientWithWallet()

      // Get user address
      const userAddress = await iexec.wallet.getAddress()
      console.log("Connected with wallet:", userAddress)

      setStatus({
        status: "validating",
        message: "Checking RLC balance...",
        progress: 10,
      })

      // Check if user has enough RLC - now it's a blocking error again
      try {
        const balance = await iexec.account.checkBalance(userAddress)
        console.log("User RLC balance:", balance)

        if (Number.parseFloat(balance.stake) < 0.1) {
          throw new Error("Insufficient RLC balance. You need at least 0.1 RLC to process data.")
        }
      } catch (err: any) {
        console.error("Error checking balance:", err)
        throw new Error(
          err.message ||
            "Failed to check RLC balance. Please make sure you have RLC tokens and try again. You need at least 0.1 RLC.",
        )
      }

      setStatus({
        status: "validating",
        message: "Preparing data for confidential processing...",
        progress: 20,
      })

      // Prepare the data for confidential processing
      const structuredData = {
        role: experienceData.role,
        experience: Number.parseInt(experienceData.experience),
        industry: experienceData.industry,
        description: experienceData.description,
        allowValidation: experienceData.allowValidation,
        timestamp: Date.now(),
        walletAddress: userAddress,
        // Add random salt for additional security
        salt: Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map((b) => b.toString(16))
          .join(""),
      }

      // Convert to JSON string
      const dataString = JSON.stringify(structuredData)
      console.log("Prepared data for processing:", dataString)

      setStatus({
        status: "encrypting",
        message: "Creating encrypted dataset...",
        progress: 30,
      })

      // Create an encrypted dataset
      let datasetAddress
      try {
        // First encrypt the data
        const encryptedDataset = await iexec.dataset.encrypt(Buffer.from(dataString), {
          name: `zkResume-data-${Date.now()}`,
          multiaddr: "/ipfs/", // Will be stored on IPFS
        })

        console.log("Encrypted dataset:", encryptedDataset)

        // Then deploy the dataset
        const { address } = await iexec.dataset.deployDataset({
          owner: userAddress,
          name: `zkResume Experience Data ${Date.now()}`,
          multiaddr: encryptedDataset.multiaddr,
          checksum: encryptedDataset.checksum,
        })

        datasetAddress = address
        console.log("Deployed dataset at address:", datasetAddress)
      } catch (err) {
        console.error("Error creating dataset:", err)
        throw new Error("Failed to create encrypted dataset. Please try again.")
      }

      setStatus({
        status: "computing",
        message: "Deploying confidential task on iExec...",
        progress: 50,
      })

      // Execute the confidential computation
      let taskId
      try {
        // Configure the computation order
        const order = {
          app: IEXEC_CONFIG.app,
          dataset: datasetAddress,
          workerpool: IEXEC_CONFIG.workerpool,
          category: IEXEC_CONFIG.category,
          params: IEXEC_CONFIG.params,
          callback: "0x0000000000000000000000000000000000000000", // No callback needed
        }

        // Submit the task
        const { taskid } = await iexec.task.submitTask(order)
        taskId = taskid

        const explorerUrl = getTaskExplorerUrl(taskId)
        console.log("Task submitted with ID:", taskId)
        console.log("Explorer URL:", explorerUrl)

        setStatus({
          status: "computing",
          message: "Processing in confidential enclave...",
          progress: 70,
          taskId: taskId,
          explorerUrl: explorerUrl,
        })
      } catch (err) {
        console.error("Error submitting task:", err)
        throw new Error("Failed to submit confidential computation task. Please try again.")
      }

      // Wait for the task to complete
      try {
        console.log("Waiting for task completion...")
        const task = await iexec.task.waitForTaskStatusChange(taskId, "COMPLETED", 180) // 3 minute timeout

        if (task.status !== "COMPLETED") {
          throw new Error(`Task failed with status: ${task.status}`)
        }

        console.log("Task completed:", task)
      } catch (err) {
        console.error("Error waiting for task:", err)
        throw new Error("Task execution timed out or failed. Please check the explorer for details.")
      }

      setStatus({
        status: "computing",
        message: "Downloading results...",
        progress: 90,
        taskId: taskId,
        explorerUrl: getTaskExplorerUrl(taskId),
      })

      // Download and process the results
      let processedResult
      try {
        // Download the result
        const resultBuffer = await iexec.task.fetchResults(taskId)
        const resultString = resultBuffer.toString()

        console.log("Raw result:", resultString)

        // Parse the result
        processedResult = JSON.parse(resultString)

        if (!processedResult.hash) {
          throw new Error("Invalid result format. Missing hash.")
        }

        console.log("Processed result:", processedResult)
      } catch (err) {
        console.error("Error fetching results:", err)
        throw new Error("Failed to download or process results. Please try again.")
      }

      // Create the final result object
      const finalResult: ProcessingResult = {
        hash:
          processedResult.hash ||
          `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")}`,
        timestamp: processedResult.timestamp || Date.now(),
        confidentialProof: processedResult.proof || `proof_${taskId}`,
        taskId: taskId,
        explorerUrl: getTaskExplorerUrl(taskId),
      }

      setStatus({
        status: "completed",
        message: "Processing completed successfully",
        progress: 100,
        taskId: taskId,
        explorerUrl: getTaskExplorerUrl(taskId),
      })

      setResult(finalResult)
      console.log("Confidential processing completed:", finalResult)

      return finalResult
    } catch (err: any) {
      console.error("Error processing experience:", err)
      setError(err.message || "Failed to process experience data")
      setStatus({
        status: "error",
        message: err.message || "Error during processing",
        progress: 0,
      })
      throw err
    }
  }, [])

  // Check the status of a deployed task
  const checkTaskStatus = useCallback(async (taskId: string): Promise<string> => {
    try {
      const iexec = await createIExecClientWithWallet()
      const task = await iexec.task.show(taskId)
      return task.status
    } catch (err: any) {
      console.error("Error checking task status:", err)
      return "ERROR"
    }
  }, [])

  // Get the result of a completed task
  const getTaskResult = useCallback(async (taskId: string): Promise<string> => {
    try {
      const iexec = await createIExecClientWithWallet()
      const resultBuffer = await iexec.task.fetchResults(taskId)
      const resultString = resultBuffer.toString()
      const processedResult = JSON.parse(resultString)
      return processedResult.hash || ""
    } catch (err: any) {
      console.error("Error getting task result:", err)
      throw err
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
    getTaskResult,
    resetProcessing,
    isProcessing: status.status !== "idle" && status.status !== "completed" && status.status !== "error",
  }
}
