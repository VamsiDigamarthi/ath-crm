import apiClient from '@/lib/api-client';

export type NoteTeam = 'ALL' | 'DOCUMENTER' | 'PREPARER' | 'QA_REVIEWER' | 'SALES' | 'FILING';

export interface ApplicationNote {
  id: string;
  message: string;
  targetTeam: NoteTeam;
  context: string;
  authorRole: string;
  authorName: string;
  authorId: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const applicationNotesService = {
  list: (applicationId: string): Promise<ApiResponse<ApplicationNote[]>> =>
    apiClient.get(`/applications/${applicationId}/notes`),

  create: (applicationId: string, targetTeam: NoteTeam, message: string): Promise<ApiResponse<ApplicationNote[]>> =>
    apiClient.post(`/applications/${applicationId}/notes`, { targetTeam, message }),
};
