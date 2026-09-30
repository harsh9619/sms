import httpService from "./http.service";

export interface SubjectMaster {
  id: string;
  name: string;
  code: string;
  category?: string;
  description?: string;
}

export interface SubjectItem {
  id: string;
  schoolId: string;
  subjectMasterId?: string;
  masterSubjectName?: string;
  name: string;
  code?: string;
  classId?: string;
  className?: string;
  classSection?: string;
  teacherId?: string;
  teacherName?: string;
  teacherEmail?: string;
}

export const classSubjectService = {
  async getSubjectMasters(): Promise<SubjectMaster[]> {
    return httpService.get<SubjectMaster[]>("/api/subjects/masters");
  },

  async getSubjects(classId?: string): Promise<SubjectItem[]> {
    const query = classId ? `?classId=${classId}` : "";
    return httpService.get<SubjectItem[]>(`/api/subjects${query}`);
  },

  async getSubjectsWithTeachers(
    params?: {
      page?: number;
      limit?: number;
      classId?: string;
      division?: string;
      teacherId?: string;
      status?: string;
      subjectName?: string;
      search?: string;
    } | string
  ): Promise<any> {
    let query = "";
    if (typeof params === "string") {
      query = params ? `?classId=${params}` : "";
    } else if (params && typeof params === "object") {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", String(params.page));
      if (params.limit) searchParams.append("limit", String(params.limit));
      if (params.classId) searchParams.append("classId", params.classId);
      if (params.division && params.division !== "ALL") searchParams.append("division", params.division);
      if (params.teacherId && params.teacherId !== "ALL") searchParams.append("teacherId", params.teacherId);
      if (params.status && params.status !== "ALL") searchParams.append("status", params.status);
      if (params.subjectName && params.subjectName !== "ALL") searchParams.append("subjectName", params.subjectName);
      if (params.search) searchParams.append("search", params.search);
      const queryString = searchParams.toString();
      query = queryString ? `?${queryString}` : "";
    }
    return httpService.get<any>(`/api/subjects/class-subject-teacher${query}`);
  },

  async syncClassSubjects(classId: string, masterSubjectIds: (number | string)[]): Promise<SubjectItem[]> {
    return httpService.post<SubjectItem[]>("/api/subjects/add-class-subject", {
      classId,
      masterSubjectIds,
    });
  },

  async assignSubjectTeacher(subjectId: string, teacherId: string | null): Promise<SubjectItem> {
    return httpService.put<SubjectItem>("/api/subjects/assign-teacher", {
      subjectId,
      teacherId,
    });
  },
};

export default classSubjectService;
