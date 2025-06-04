"use client"

import { createIExecClient, IEXEC_CONFIG } from "./iexec-client"
import type { ExperienceData } from "../types/experience"

export interface ProcessingResult {
  hash: string
  timestamp: number
  confidentialProof: string
  taskId: string
}

export class ConfidentialProcessor {
  private iexec: any

  constructor() {
    if (typeof window !== "undefined") {
      this.iexec = createIExecClient()
    }
  }

  /**
   * Processes work experience data confidentially using iExec
   */
  async processExperience(experienceData: ExperienceData): Promise<ProcessingResult> {
    try {
      // 1. Prepare data for confidential processing
      const confidentialData = await this.prepareConfidentialData(experienceData)

      // 2. Create dataset with encrypted data
      const dataset = await this.createDataset(confidentialData)

      // 3. Execute confidential computation
      const task = await this.executeConfidentialComputation(dataset)

      // 4. Get the result
      const result = await this.getComputationResult(task)

      return result
    } catch (error) {
      console.error("Error in confidential processing:", error)
      throw new Error("Error processing data confidentially")
    }
  }

  /**
   * Prepares and encrypts data for iExec
   */
  private async prepareConfidentialData(data: ExperienceData) {
    // Create an object with structured data
    const structuredData = {
      role: data.role,
      experience: Number.parseInt(data.experience),
      industry: data.industry,
      description: data.description,
      allowValidation: data.allowValidation,
      timestamp: Date.now(),
      // Add random salt for additional security
      salt: crypto.getRandomValues(new Uint8Array(32)),
    }

    // Convert to JSON for processing
    return JSON.stringify(structuredData)
  }

  /**
   * Creates an encrypted dataset in iExec
   */
  private async createDataset(data: string) {
    try {
      // Encrypt data using iExec's native encryption
      const encryptedData = await this.iexec.dataset.encrypt(Buffer.from(data, "utf8"), {
        name: `zkresume-data-${Date.now()}`,
        multiaddr: "/ipfs/QmTJ41EuPEwiPTGrYVPbXgMGvmgzsRYWWMmw6krVDN94nh", // IPFS multiaddr
      })

      // Deploy the dataset
      const { address } = await this.iexec.dataset.deployDataset({
        owner: await this.iexec.wallet.getAddress(),
        name: `zkResume Experience Data ${Date.now()}`,
        multiaddr: encryptedData.multiaddr,
        checksum: encryptedData.checksum,
      })

      return address
    } catch (error) {
      console.error("Error creating dataset:", error)
      throw error
    }
  }

  /**
   * Executes confidential computation in iExec
   */
  private async executeConfidentialComputation(datasetAddress: string) {
    try {
      const userAddress = await this.iexec.wallet.getAddress()

      // Configure computation order
      const computationOrder = {
        app: IEXEC_CONFIG.app,
        dataset: datasetAddress,
        workerpool: IEXEC_CONFIG.workerpool,
        category: IEXEC_CONFIG.category,
        params: {
          ...IEXEC_CONFIG.params,
          iexec_args: "process-experience", // Command for our application
        },
        callback: "0x0000000000000000000000000000000000000000", // No callback
      }

      // Execute the task
      const { taskid } = await this.iexec.task.submitTask(computationOrder)

      console.log("Task submitted with ID:", taskid)
      return taskid
    } catch (error) {
      console.error("Error executing computation:", error)
      throw error
    }
  }

  /**
   * Gets the computation result
   */
  private async getComputationResult(taskId: string): Promise<ProcessingResult> {
    try {
      // Wait for task to complete
      console.log("Waiting for task completion...")
      const task = await this.iexec.task.waitForTaskStatusChange(taskId, "COMPLETED")

      if (task.status !== "COMPLETED") {
        throw new Error(`Task failed with status: ${task.status}`)
      }

      // Download the result
      const result = await this.iexec.task.fetchResults(taskId)

      // The result should contain the generated hash and proof
      const processedResult = JSON.parse(result.toString())

      return {
        hash: processedResult.hash,
        timestamp: processedResult.timestamp,
        confidentialProof: processedResult.proof,
        taskId: taskId,
      }
    } catch (error) {
      console.error("Error getting result:", error)
      throw error
    }
  }

  /**
   * Verifies task status
   */
  async getTaskStatus(taskId: string) {
    try {
      const task = await this.iexec.task.show(taskId)
      return task.status
    } catch (error) {
      console.error("Error getting task status:", error)
      throw error
    }
  }
}
