import API_CONFIG from "@/utils/config";

const API_BASE_URL = API_CONFIG.BASE_URL;

export interface ImageUploadResponse {
  message: string;
  success: boolean;
  data?: {
    url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    size: number;
  };
  error?: string;
}

export interface ImageDeleteResponse {
  message: string;
  success: boolean;
  data?: any;
  error?: string;
}

class ImageService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      credentials: "include",
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append("image", file);

    return this.makeRequest<ImageUploadResponse>("/api/cloudinary/upload", {
      method: "POST",
      body: formData,
    });
  }

  async deleteImage(publicId: string): Promise<ImageDeleteResponse> {
    return this.makeRequest<ImageDeleteResponse>(
      `/api/cloudinary/${publicId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Upload multiple images sequentially
   */
  async uploadMultipleImages(files: File[]): Promise<ImageUploadResponse[]> {
    const results: ImageUploadResponse[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage(file);
        results.push(result);
      } catch (error) {
        results.push({
          message: "Failed to upload image",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }
}

export const imageService = new ImageService();
export default imageService;
