export interface UploadOptions {
  file: File
  folder?: string
}

export interface UploadResult {
  url: string
  key: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function uploadFile({ file }: UploadOptions): Promise<UploadResult> {
  throw new Error("Storage service not implemented")
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteFile(key: string): Promise<void> {
  throw new Error("Storage service not implemented")
}
