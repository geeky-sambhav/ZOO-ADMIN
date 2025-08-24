// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "",
  ENDPOINTS: {
    ANIMALS: "/api/animals",
    MEDICAL_RECORDS: "/api/medical-records",
    NOTIFICATIONS: "/api/notifications",
    UPLOAD: "/api/cloudinary/upload",
    INVENTORY: "/api/inventory",
  },
};

export default API_CONFIG;
