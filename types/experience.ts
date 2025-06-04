export interface ExperienceData {
  role: string
  experience: string
  industry: string
  description: string
  allowValidation: boolean
}

export interface ProcessingStatus {
  status: "idle" | "validating" | "encrypting" | "computing" | "completed" | "error"
  message: string
  progress: number
  taskId?: string
}
