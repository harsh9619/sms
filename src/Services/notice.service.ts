import httpService from "Services/http.service";
import type { NoticeRecord } from "../types";

export const noticeService = {
  getNotices: async (audience?: string): Promise<NoticeRecord[]> => {
    const queryStr = audience ? `?audience=${encodeURIComponent(audience)}` : "";
    return httpService.get<NoticeRecord[]>(`/api/notices${queryStr}`);
  },

  createNotice: async (n: any): Promise<NoticeRecord> => {
    return httpService.post<NoticeRecord>("/api/notices", n);
  },

  updateNotice: async (id: string, n: any): Promise<NoticeRecord> => {
    return httpService.put<NoticeRecord>(`/api/notices/${id}`, n);
  },

  deleteNotice: async (id: string): Promise<any> => {
    return httpService.delete(`/api/notices/${id}`);
  },
};

export default noticeService;
