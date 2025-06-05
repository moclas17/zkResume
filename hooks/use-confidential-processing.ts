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
  isSimulated?: boolean
}

export interface ProcessingStatus {
  status: "idle" | "validating" | "encrypting" | "computing" | "completed" | "error"
  message: string
  progress: number
  taskId?: string
  explorerUrl?: string
  isSimulated?: boolean
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

      // Check if user has enough RLC - but don't block if they don't
      let hasEnoughRLC = false
      let userBalance = "0"
      try {
        const balance = await iexec.account.checkBalance(userAddress)
        userBalance = balance.stake
        console.log("User RLC balance:", balance)

        hasEnoughRLC = Number.parseFloat(balance.stake) >= 0.1
      } catch (err) {
        console.warn("Could not check RLC balance:", err)
        hasEnoughRLC = false
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

      // If user doesn't have enough RLC, use simulation mode
      if (!hasEnoughRLC) {
        console.log("Insufficient RLC balance, using simulation mode")
        return await simulateProcessing(structuredData, userBalance)
      }

      // Real iExec processing
      return await realIExecProcessing(iexec, structuredData, userAddress)
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

  // Simulation mode when user doesn't have RLC
  const simulateProcessing = async (structuredData: any, userBalance: string) => {
    setStatus({
      status: "encrypting",
      message: "⚠️ Simulating encryption (insufficient RLC balance)...",
      progress: 30,
      isSimulated: true,
    })

    // Simulate encryption process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a mock task ID
    const mockTaskId = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`

    setStatus({
      status: "computing",
      message: "⚠️ Simulating confidential computation...",
      progress: 50,
      taskId: mockTaskId,
      explorerUrl: getTaskExplorerUrl(mockTaskId),
      isSimulated: true,
    })

    // Simulate computation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setStatus({
      status: "computing",
      message: "⚠️ Generating simulated proof...",
      progress: 80,
      taskId: mockTaskId,
      explorerUrl: getTaskExplorerUrl(mockTaskId),
      isSimulated: true,
    })

    // Generate cryptographic hash of the processed data (this is real)
    const dataString = JSON.stringify(structuredData)
    const encoder = new TextEncoder()
    const data = encoder.encode(dataString)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    const finalHash = `0x${hashHex}`

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const finalResult: ProcessingResult = {
      hash: finalHash,
      timestamp: Date.now(),
      confidentialProof: `simulated_proof_${mockTaskId}`,
      taskId: mockTaskId,
      explorerUrl: getTaskExplorerUrl(mockTaskId),
      isSimulated: true,
    }

    setStatus({
      status: "completed",
      message: `⚠️ Simulation completed (RLC balance: ${userBalance})`,
      progress: 100,
      taskId: mockTaskId,
      explorerUrl: getTaskExplorerUrl(mockTaskId),
      isSimulated: true,
    })

    setResult(finalResult)
    console.log("Simulated processing completed:", finalResult)

    return finalResult
  }

  // Real iExec processing when user has RLC
  const realIExecProcessing = async (iexec: any, structuredData: any, userAddress: string) => {
    const dataString = JSON.stringify(structuredData)

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
      isSimulated: false,
    }

    setStatus({
      status: "completed",
      message: "Processing completed successfully",
      progress: 100,
      taskId: taskId,
      explorerUrl: getTaskExplorerUrl(taskId),
    })

    setResult(finalResult)
    console.log("Real iExec processing completed:", finalResult)

    return finalResult
  }

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
