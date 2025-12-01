// User profile type
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  is_banned: boolean;
  created_at: string;
}

// Image record type
export interface Image {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  url?: string; 
}

// Response type for upload operations
export interface UploadResponse {
  success: boolean;
  image?: Image;
  error?: string;
}

// Response type for generic operations
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
