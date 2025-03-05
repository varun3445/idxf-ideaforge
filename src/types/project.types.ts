
export interface Project {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  share_code: string | null;
}

export interface ProjectStep {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string;
  joined_at: string;
  user?: {
    name: string;
    avatar: string | null;
  };
}

export interface QRCodeResponse {
  qrCodeUrl: string;
  shareCode: string;
  shareUrl: string;
}

export interface JoinProjectResponse {
  success: boolean;
  message: string;
  project: Project;
}
