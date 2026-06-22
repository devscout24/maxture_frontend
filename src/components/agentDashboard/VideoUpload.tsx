export type UploadStatus = "pending" | "completed";

export interface Step2InitResponseData {
  property_id: number;
  upload_id: string;
  total_chunks: number;
  status: UploadStatus;
}

export interface Step2ChunkResponseData {
  upload_id: string;
  chunk_number?: number;
  received_chunks?: number;
  total_chunks?: number;
  status: UploadStatus;
  video_url?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Record<string, string[] | string>;
  exception?: string;
  status?: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface Step2ClientOptions {
  baseUrl: string;
  token: string;
  endpointBuilder?: (propertyId: number | string) => string;
}

export interface InitStep2Input {
  propertyId: number | string;
  images: File[];
  videoFileName: string;
  totalChunks: number;
  fileSize: number;
}

export interface UploadChunkInput {
  propertyId: number | string;
  uploadId: string;
  chunkNumber: number;
  chunkFile: Blob;
  chunkFileName?: string;
}

export interface UploadVideoWithChunksInput {
  propertyId: number | string;
  images: File[];
  videoFile: File;
  chunkSizeBytes?: number;
  onProgress?: (progress: {
    uploadId: string;
    chunkNumber: number;
    totalChunks: number;
    percent: number;
  }) => void;
}

const DEFAULT_CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB to reduce upload stalls on large files
const REQUEST_TIMEOUT_MS = 60_000;

type FileChunk = {
  blob: Blob;
  fileName: string;
};

function splitFileIntoChunkFiles(
  file: File,
  chunkSizeBytes = DEFAULT_CHUNK_SIZE,
  fileNameBuilder: (chunkNumber: number) => string = (chunkNumber) =>
    buildChunkFileName(file.name, chunkNumber),
): File[] {
  const chunks: File[] = [];
  let start = 0;
  let chunkNumber = 1;

  while (start < file.size) {
    const end = Math.min(start + chunkSizeBytes, file.size);
    const chunk = new File(
      [file.slice(start, end, file.type || "video/mp4")],
      fileNameBuilder(chunkNumber),
      { type: file.type || "video/mp4" },
    );
    chunks.push(chunk);
    start = end;
    chunkNumber += 1;
  }

  return chunks;
}

function buildChunkFileName(originalFileName: string, chunkNumber: number): string {
  const extensionIndex = originalFileName.lastIndexOf(".");
  if (extensionIndex === -1) return `chunk_${chunkNumber}.mp4`;
  const baseName = originalFileName.slice(0, extensionIndex);
  const extension = originalFileName.slice(extensionIndex);
  return `${baseName}.part${chunkNumber}${extension}`;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function defaultEndpointBuilder(propertyId: number | string): string {
  return `/api/property/${propertyId}/step2`;
}

function getStep2Endpoint(options: Step2ClientOptions, propertyId: number | string): string {
  const endpoint = (options.endpointBuilder ?? defaultEndpointBuilder)(propertyId);
  return `${normalizeBaseUrl(options.baseUrl)}${endpoint}`;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readResponseTextWithTimeout(response: Response, timeoutMs = REQUEST_TIMEOUT_MS): Promise<string> {
  return await Promise.race([
    response.text(),
    new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error(`Response body timed out after ${Math.round(timeoutMs / 1000)} seconds`)), timeoutMs);
    }),
  ]);
}

async function postFormData<T>(url: string, token: string, formData: FormData): Promise<ApiResponse<T>> {
  console.debug(`[VideoUpload] POST ${url} - token present: ${!!token}`);
  let response: Response;

  try {
    response = await fetchWithTimeout(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? `Request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)} seconds`
      : error instanceof Error
        ? error.message
        : "Network request failed";
    return { success: false, message };
  }

  console.debug(`[VideoUpload] Response status for ${url}:`, response.status);

  if (response.status === 401 || response.status === 403) {
    const raw = await readResponseTextWithTimeout(response).catch(() => "");
    let json: any = null;
    try { json = raw ? JSON.parse(raw) : null; } catch { json = null; }
    const serverMessage = json?.message || null;
    return {
      success: false,
      message: serverMessage || "Authentication failed - user may be deleted or session expired",
      status: response.status,
    };
  }

  const raw = await readResponseTextWithTimeout(response);
  let json: any = null;
  try { json = raw ? JSON.parse(raw) : null; } catch { json = null; }

  if (!response.ok) {
    const message = (json && (json.message || json.error)) || raw || `Request failed with status ${response.status}`;
    return {
      success: false,
      message,
      errors: json?.errors,
      status: response.status,
    };
  }

  return (json ?? { success: false, message: "Empty response from server" }) as ApiResponse<T>;
}

export async function initPropertyStep2Upload(
  options: Step2ClientOptions,
  input: InitStep2Input,
): Promise<ApiResponse<Step2InitResponseData>> {
  const url = getStep2Endpoint(options, input.propertyId);
  const formData = new FormData();
  for (const image of input.images) {
    formData.append("images[]", image);
    formData.append("uploaded_images[]", image);
  }
  formData.append("video_name", input.videoFileName);
  formData.append("total_chunks", String(input.totalChunks));
  formData.append("file_size", String(input.fileSize));
  return postFormData<Step2InitResponseData>(url, options.token, formData);
}

export async function uploadPropertyStep2Chunk(
  options: Step2ClientOptions,
  input: UploadChunkInput,
): Promise<ApiResponse<Step2ChunkResponseData>> {
  const url = getStep2Endpoint(options, input.propertyId);
  const formData = new FormData();
  formData.append("upload_id", input.uploadId);
  formData.append("chunk_number", String(input.chunkNumber));
  formData.append("chunk_data", input.chunkFile, input.chunkFileName ?? "chunk.mp4");
  return postFormData<Step2ChunkResponseData>(url, options.token, formData);
}

export function splitFileIntoChunks(file: File, chunkSizeBytes = DEFAULT_CHUNK_SIZE): FileChunk[] {
  const chunks: FileChunk[] = [];
  let start = 0;
  let chunkNumber = 1;
  while (start < file.size) {
    const end = Math.min(start + chunkSizeBytes, file.size);
    chunks.push({
      blob: file.slice(start, end, file.type || "video/mp4"),
      fileName: buildChunkFileName(file.name, chunkNumber),
    });
    start = end;
    chunkNumber += 1;
  }
  return chunks;
}

export async function uploadPropertyStep2VideoWithChunks(
  options: Step2ClientOptions,
  input: UploadVideoWithChunksInput,
): Promise<ApiResponse<Step2ChunkResponseData>> {
  const chunkSize = input.chunkSizeBytes ?? DEFAULT_CHUNK_SIZE;
  const chunks = splitFileIntoChunks(input.videoFile, chunkSize);
  const imagesToSend = input.images?.length > 0 ? input.images : [];

  const initResponse = await initPropertyStep2Upload(options, {
    propertyId: input.propertyId,
    images: imagesToSend,
    videoFileName: input.videoFile.name,
    totalChunks: chunks.length,
    fileSize: input.videoFile.size,
  });

  console.debug("[VideoUpload] initResponse:", initResponse);

  let uploadInitResponse = initResponse;
  if (!initResponse.success && (initResponse.status === 422 || initResponse.message?.includes("422"))) {
    const retryResponse = await initPropertyStep2Upload(options, {
      propertyId: input.propertyId,
      images: [],
      videoFileName: input.videoFile.name,
      totalChunks: chunks.length,
      fileSize: input.videoFile.size,
    });
    if (!retryResponse.success) return retryResponse;
    uploadInitResponse = retryResponse;
  } else if (!initResponse.success) {
    return initResponse;
  }

  const successfulInitResponse = uploadInitResponse.success ? uploadInitResponse : null;
  const uploadId = successfulInitResponse?.data.upload_id ?? "";
  const totalChunks = successfulInitResponse?.data.total_chunks ?? chunks.length;

  let lastChunkResponse: ApiResponse<Step2ChunkResponseData> = {
    success: true,
    data: { upload_id: uploadId, status: "pending", total_chunks: totalChunks, received_chunks: 0 },
  };

  const concurrentUploads = 1; // single concurrent upload to avoid server overload
  const uploadPromises: Promise<ApiResponse<Step2ChunkResponseData>>[] = [];
  let completedChunks = 0;
  let lastReportedProgress = 0;
  let uploadCompleted = false;

  const reportProgress = (currentProgress: number) => {
    const roundedProgress = Math.round(currentProgress / 5) * 5;
    if (roundedProgress > lastReportedProgress && roundedProgress <= 100) {
      lastReportedProgress = roundedProgress;
      input.onProgress?.({ uploadId, chunkNumber: completedChunks, totalChunks, percent: roundedProgress });
    }
  };

  for (let i = 0; i < chunks.length; i++) {
    const chunkNumber = i + 1;
    // Upload with retry/backoff per chunk
    const uploadPromise = (async () => {
      const maxRetries = 3;
      let attempt = 0;
      while (true) {
        try {
          const response = await uploadPropertyStep2Chunk(options, {
            propertyId: input.propertyId,
            uploadId,
            chunkNumber,
            chunkFile: chunks[i].blob,
            chunkFileName: chunks[i].fileName,
          });

          if (!response.success) {
            attempt++;
            console.warn(`[VideoUpload] Chunk ${chunkNumber} attempt ${attempt} returned an error response:`, response);
            if (attempt >= maxRetries) {
              return response;
            }
            const backoffMs = 500 * Math.pow(2, attempt - 1);
            await new Promise((res) => setTimeout(res, backoffMs));
            continue;
          }

          completedChunks++;
          if (response.success && response.data?.status === "completed") uploadCompleted = true;
          if (response.success) lastChunkResponse = response;
          reportProgress((completedChunks / totalChunks) * 100);
          return response;
        } catch (err) {
          attempt++;
          console.warn(`[VideoUpload] Chunk ${chunkNumber} attempt ${attempt} failed:`, err);
          if (attempt >= maxRetries) {
            return { success: false, message: err instanceof Error ? err.message : String(err) } as ApiResponse<Step2ChunkResponseData>;
          }
          // exponential backoff
          const backoffMs = 500 * Math.pow(2, attempt - 1);
          await new Promise((res) => setTimeout(res, backoffMs));
        }
      }
    })();

    uploadPromises.push(uploadPromise);

    if (uploadPromises.length >= concurrentUploads || i === chunks.length - 1) {
      try {
        const results = await Promise.all(uploadPromises);
        const failedUpload = results.find((r) => !r.success);
        if (failedUpload) return failedUpload;
        uploadPromises.length = 0;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Upload failed during chunk processing",
        };
      }
    }
  }

  // After all chunks attempted, if the number of completed chunks meets or
  // exceeds the expected total, treat the upload as successful even if the
  // backend never returned a final `status: "completed"` flag.
  if (completedChunks >= totalChunks) {
    const successResponse: ApiResponse<Step2ChunkResponseData> = lastChunkResponse.success
      ? lastChunkResponse
      : {
          success: true,
          data: {
            upload_id: uploadId,
            status: "completed",
            total_chunks: totalChunks,
            received_chunks: completedChunks,
            chunk_number: totalChunks,
          },
        };

    // Always report final progress to the caller
    input.onProgress?.({ uploadId, chunkNumber: totalChunks, totalChunks, percent: 100 });
    return successResponse;
  }

  // If we reach here then not all chunks completed and no failure was returned
  // earlier — report final 100% to avoid UI stall, but surface the lastChunkResponse
  input.onProgress?.({ uploadId, chunkNumber: totalChunks, totalChunks, percent: 100 });
  return lastChunkResponse;
}

// ============================================================================
// REPLACE VIDEO FUNCTIONALITY
// ============================================================================

export interface ReplaceVideoInitData {
  property_id: number;
  upload_id: string;
  total_chunks: number;
  status: UploadStatus;
}

export interface ReplaceVideoChunkData {
  upload_id: string;
  chunk_number?: number;
  received_chunks?: number;
  total_chunks?: number;
  status: UploadStatus;
  video_url?: string;
}

export interface ReplaceVideoClientOptions {
  baseUrl: string;
  token: string;
}

export interface InitReplaceVideoInput {
  propertyId: number | string;
  videoFileName: string;
  totalChunks: number;
  fileSize: number;
  shouldReplace?: "yes" | "no";
}

export interface UploadReplaceChunkInput {
  propertyId: number | string;
  uploadId: string;
  chunkNumber: number;
  chunkFile: File;
  chunkFileName?: string;
}

export interface ReplaceVideoWithChunksInput {
  propertyId: number | string;
  videoFile: File;
  chunkSizeBytes?: number;
  onProgress?: (progress: {
    uploadId: string;
    chunkNumber: number;
    totalChunks: number;
    percent: number;
  }) => void;
}

function getReplaceVideoInitUrl(baseUrl: string, propertyId: number | string): string {
  return `${normalizeBaseUrl(baseUrl)}/property/${propertyId}/replace-video`;
}

function getReplaceVideoChunkUrl(baseUrl: string, propertyId: number | string): string {
  return `${normalizeBaseUrl(baseUrl)}/property/${propertyId}/upload-video-chunk`;
}

async function postReplaceVideoFormData<T>(
  url: string,
  token: string,
  formData: FormData,
): Promise<ApiResponse<T>> {
  let response: Response;

  try {
    response = await fetchWithTimeout(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? `Request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)} seconds`
      : error instanceof Error
        ? error.message
        : "Network request failed";
    return { success: false, message };
  }

  // Read body once for all cases
  const raw = await readResponseTextWithTimeout(response).catch(() => "");
  let json: any = null;
  try { json = raw ? JSON.parse(raw) : null; } catch { json = null; }

  // Surface the real backend message for 401/403/422 etc.
  if (!response.ok) {
    const message =
      (json && (json.message || json.error)) ||
      raw ||
      `Request failed with status ${response.status}`;
    return {
      success: false,
      message,
      errors: json?.errors,
      status: response.status,
    };
  }

  return (json ?? { success: false, message: "Empty response from server" }) as ApiResponse<T>;
}

export async function initReplaceVideoUpload(
  options: ReplaceVideoClientOptions,
  input: InitReplaceVideoInput,
): Promise<ApiResponse<ReplaceVideoInitData>> {
  const url = getReplaceVideoInitUrl(options.baseUrl, input.propertyId);
  const formData = new FormData();
  formData.append("property_id", String(input.propertyId));
  formData.append("should_replace", input.shouldReplace ?? "yes");
  formData.append("video_name", input.videoFileName);
  formData.append("total_chunks", String(input.totalChunks));
  formData.append("file_size", String(input.fileSize));
  return postReplaceVideoFormData<ReplaceVideoInitData>(url, options.token, formData);
}

export async function uploadReplaceVideoChunk(
  options: ReplaceVideoClientOptions,
  input: UploadReplaceChunkInput,
): Promise<ApiResponse<ReplaceVideoChunkData>> {
  const url = getReplaceVideoChunkUrl(options.baseUrl, input.propertyId);
  const fileName = input.chunkFileName ?? "chunk.mp4";
  const formData = new FormData();
  formData.append("property_id", String(input.propertyId));
  formData.append("upload_id", input.uploadId);
  formData.append("chunk_number", String(input.chunkNumber));
  formData.append("video_chunk", input.chunkFile, fileName);
  return postReplaceVideoFormData<ReplaceVideoChunkData>(url, options.token, formData);
}

export async function replacePropertyVideoWithChunks(
  options: ReplaceVideoClientOptions,
  input: ReplaceVideoWithChunksInput,
): Promise<ApiResponse<ReplaceVideoChunkData>> {
  const chunkSize = input.chunkSizeBytes ?? DEFAULT_CHUNK_SIZE;
  const chunks = splitFileIntoChunkFiles(
    input.videoFile,
    chunkSize,
    (chunkNumber) => buildChunkFileName(input.videoFile.name, chunkNumber), // FIX: unique name per chunk
  );

  const initResponse = await initReplaceVideoUpload(options, {
    propertyId: input.propertyId,
    videoFileName: input.videoFile.name,
    totalChunks: chunks.length,
    fileSize: input.videoFile.size,
    shouldReplace: "yes",
  });

  if (!initResponse.success) {
    return initResponse; // Real backend message surfaces here (403, 422, etc.)
  }

  const uploadId = initResponse.data.upload_id;
  const totalChunks = initResponse.data.total_chunks;

  let lastChunkResponse: ApiResponse<ReplaceVideoChunkData> = {
    success: true,
    data: { upload_id: uploadId, status: "pending", total_chunks: totalChunks, received_chunks: 0 },
  };

  const concurrentUploads = 2;
  const uploadPromises: Promise<ApiResponse<ReplaceVideoChunkData>>[] = [];
  let completedChunks = 0;
  let lastReportedProgress = 0;
  let uploadCompleted = false;

  const reportProgress = (currentProgress: number) => {
    const roundedProgress = Math.round(currentProgress / 5) * 5;
    if (roundedProgress > lastReportedProgress && roundedProgress <= 100) {
      lastReportedProgress = roundedProgress;
      input.onProgress?.({ uploadId, chunkNumber: completedChunks, totalChunks, percent: roundedProgress });
    }
  };

  for (let i = 0; i < chunks.length; i++) {
    const chunkNumber = i + 1;

    const uploadPromise = uploadReplaceVideoChunk(options, {
      propertyId: input.propertyId,
      uploadId,
      chunkNumber,
      chunkFile: chunks[i],
      chunkFileName: buildChunkFileName(input.videoFile.name, chunkNumber),
    }).then((response) => {
      completedChunks++;
      if (response.success && response.data?.status === "completed") uploadCompleted = true;
      if (response.success) lastChunkResponse = response;
      reportProgress((completedChunks / totalChunks) * 100);
      return response;
    }).catch((error) => {
      console.error("Replace video chunk upload error:", error);
      throw error;
    });

    uploadPromises.push(uploadPromise);

    if (uploadPromises.length >= concurrentUploads || i === chunks.length - 1) {
      try {
        const results = await Promise.all(uploadPromises);
        const failedUpload = results.find((r) => !r.success);
        if (failedUpload) return failedUpload;
        if (uploadCompleted && completedChunks >= totalChunks) break;
        uploadPromises.length = 0;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Video replacement failed during chunk processing",
        };
      }
    }
  }

  if (lastReportedProgress < 100) {
    input.onProgress?.({ uploadId, chunkNumber: totalChunks, totalChunks, percent: 100 });
  }

  return lastChunkResponse;
}