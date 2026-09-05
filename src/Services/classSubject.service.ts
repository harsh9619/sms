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

  async getSubjectsWithTeachers(classId?: string): Promise<SubjectItem[]> {
    const query = classId ? `?classId=${classId}` : "";
    return httpService.get<SubjectItem[]>(`/api/subjects/with-teachers${query}`);
  },

  async syncClassSubjects(classId: string, masterSubjectIds: (number | string)[]): Promise<SubjectItem[]> {
    return httpService.post<SubjectItem[]>("/api/subjects/sync-class", {
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
