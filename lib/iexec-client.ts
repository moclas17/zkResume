import { IExec } from "iexec"

// iExec configuration for production or testnet
export const createIExecClient = () => {
  // Use iExec testnet for development
  const iexec = new IExec({
    ethProvider: window.ethereum || "https://bellecour.iex.ec", // iExec Bellecour network
  })

  return iexec
}

// iExec application address for confidential processing
export const CONFIDENTIAL_APP_ADDRESS = "0x..." // This will be your deployed app address on iExec

// Dataset and workerpool configuration
export const IEXEC_CONFIG = {
  app: CONFIDENTIAL_APP_ADDRESS,
  workerpool: "0x...", // Workerpool that supports SGX
  category: 0, // Computation category
  params: {
    iexec_developer_logger: true,
    iexec_result_encryption: true, // Enable result encryption
    iexec_result_storage_provider: "ipfs",
  },
}
