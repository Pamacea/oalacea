export interface UploadOptions {
  file: File
  folder?: string
}

export interface UploadResult {
  url: string
  key: string
}

export async function uploadFile({ file, folder = "uploads" }: UploadOptions): Promise<UploadResult> {
  throw new Error("Storage service not implemented")
}

export async function deleteFile(key: string): Promise<void> {
  throw new Error("Storage service not implemented")
}
