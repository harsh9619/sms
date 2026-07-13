async function apiFetch(url: string, options: RequestInit = {}) {
  const schoolId = localStorage.getItem("sms_active_school_id");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  // Clean up content-type for non-json requests if they occur
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  let finalUrl = url;
  if (schoolId && finalUrl.startsWith('/api/') && !finalUrl.startsWith('/api/schools')) {
    finalUrl = finalUrl.replace(/^\/api\//, `/api/${schoolId}/`);
  }

  return fetch(finalUrl, {
    ...options,
    headers,
  });
}

export async function fetchSchools() {
  const res = await apiFetch('/api/schools');
  if (!res.ok) throw new Error('Failed to fetch schools');
  return res.json();
}

export async function fetchStudents() {
  const res = await apiFetch('/api/students');
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function fetchTeachers() {
  const res = await apiFetch('/api/teachers');
  if (!res.ok) throw new Error('Failed to fetch teachers');
  return res.json();
}

export async function fetchAttendance() {
  const res = await apiFetch('/api/attendance');
  if (!res.ok) throw new Error('Failed to fetch attendance');
  return res.json();
}

export async function fetchClasses() {
  const res = await apiFetch('/api/classes');
  if (!res.ok) throw new Error('Failed to fetch classes');
  return res.json();
}

export async function createClass(cls: any) {
  const res = await apiFetch('/api/classes', { method: 'POST', body: JSON.stringify(cls) });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create class');
  }
  return res.json();
}

export async function updateClass(id: string, cls: any) {
  const res = await apiFetch(`/api/classes/${id}`, { method: 'PUT', body: JSON.stringify(cls) });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update class');
  }
  return res.json();
}

export async function deleteClass(id: string) {
  const res = await apiFetch(`/api/classes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete class');
  return res.json();
}

export async function fetchSubjects(params?: { classId?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.classId) queryParams.append('classId', params.classId);
  const res = await apiFetch(`/api/subjects?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

export async function fetchUsers() {
  const res = await apiFetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchAllUsers() {
  const res = await apiFetch('/api/users?all=true');
  if (!res.ok) throw new Error('Failed to fetch all users');
  return res.json();
}

export async function createUser(user: any) {
  const res = await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(user) });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create user');
  }
  return res.json();
}

export async function updateUser(id: string, user: any) {
  const res = await apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(user) });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update user');
  }
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete user');
  }
  return res.json();
}

export async function fetchFees() {
  const res = await apiFetch('/api/fees');
  if (!res.ok) throw new Error('Failed to fetch fees');
  return res.json();
}

export async function fetchSalaries() {
  const res = await apiFetch('/api/salaries');
  if (!res.ok) throw new Error('Failed to fetch salaries');
  return res.json();
}

export async function createFee(fee: any) {
  const res = await apiFetch('/api/fees', { method: 'POST', body: JSON.stringify(fee) });
  if (!res.ok) throw new Error('Failed to create fee');
  return res.json();
}

export async function updateFee(id: string, fee: any) {
  const res = await apiFetch(`/api/fees/${id}`, { method: 'PUT', body: JSON.stringify(fee) });
  if (!res.ok) throw new Error('Failed to update fee');
  return res.json();
}

export async function deleteFee(id: string) {
  const res = await apiFetch(`/api/fees/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete fee');
  return res.json();
}

export async function createSalary(sal: any) {
  const res = await apiFetch('/api/salaries', { method: 'POST', body: JSON.stringify(sal) });
  if (!res.ok) throw new Error('Failed to create salary');
  return res.json();
}

export async function updateSalary(id: string, sal: any) {
  const res = await apiFetch(`/api/salaries/${id}`, { method: 'PUT', body: JSON.stringify(sal) });
  if (!res.ok) throw new Error('Failed to update salary');
  return res.json();
}

export async function deleteSalary(id: string) {
  const res = await apiFetch(`/api/salaries/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete salary');
  return res.json();
}

// --- Timetable API ---
export async function fetchTimetables(params?: { classId?: string; teacherId?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.classId) queryParams.append('classId', params.classId);
  if (params?.teacherId) queryParams.append('teacherId', params.teacherId);
  const res = await apiFetch(`/api/timetables?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch timetables');
  return res.json();
}

export async function createTimetable(t: any) {
  const res = await apiFetch('/api/timetables', { method: 'POST', body: JSON.stringify(t) });
  if (!res.ok) throw new Error('Failed to create timetable slot');
  return res.json();
}

export async function updateTimetable(id: string, t: any) {
  const res = await apiFetch(`/api/timetables/${id}`, { method: 'PUT', body: JSON.stringify(t) });
  if (!res.ok) throw new Error('Failed to update timetable slot');
  return res.json();
}

export async function deleteTimetable(id: string) {
  const res = await apiFetch(`/api/timetables/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete timetable slot');
  return res.json();
}

// --- Homework API ---
export async function fetchHomework(params?: { classId?: string; teacherId?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.classId) queryParams.append('classId', params.classId);
  if (params?.teacherId) queryParams.append('teacherId', params.teacherId);
  const res = await apiFetch(`/api/homework?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch homework');
  return res.json();
}

export async function createHomework(hw: any) {
  const res = await apiFetch('/api/homework', { method: 'POST', body: JSON.stringify(hw) });
  if (!res.ok) throw new Error('Failed to create homework');
  return res.json();
}

export async function updateHomework(id: string, hw: any) {
  const res = await apiFetch(`/api/homework/${id}`, { method: 'PUT', body: JSON.stringify(hw) });
  if (!res.ok) throw new Error('Failed to update homework');
  return res.json();
}

export async function deleteHomework(id: string) {
  const res = await apiFetch(`/api/homework/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete homework');
  return res.json();
}

// --- Notices API ---
export async function fetchNotices(audience?: string) {
  const queryParams = new URLSearchParams();
  if (audience) queryParams.append('audience', audience);
  const res = await apiFetch(`/api/notices?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch notices');
  return res.json();
}

export async function createNotice(n: any) {
  const res = await apiFetch('/api/notices', { method: 'POST', body: JSON.stringify(n) });
  if (!res.ok) throw new Error('Failed to create notice');
  return res.json();
}

export async function updateNotice(id: string, n: any) {
  const res = await apiFetch(`/api/notices/${id}`, { method: 'PUT', body: JSON.stringify(n) });
  if (!res.ok) throw new Error('Failed to update notice');
  return res.json();
}

export async function deleteNotice(id: string) {
  const res = await apiFetch(`/api/notices/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete notice');
  return res.json();
}

// --- Marks API ---
export async function fetchMarks(params?: { studentId?: string; classId?: string; subjectId?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.studentId) queryParams.append('studentId', params.studentId);
  if (params?.classId) queryParams.append('classId', params.classId);
  if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
  const res = await apiFetch(`/api/marks?${queryParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch marks');
  return res.json();
}

export async function createMarks(m: any) {
  const res = await apiFetch('/api/marks', { method: 'POST', body: JSON.stringify(m) });
  if (!res.ok) throw new Error('Failed to create marks');
  return res.json();
}

export async function updateMarks(id: string, m: any) {
  const res = await apiFetch(`/api/marks/${id}`, { method: 'PUT', body: JSON.stringify(m) });
  if (!res.ok) throw new Error('Failed to update marks');
  return res.json();
}

export async function deleteMarks(id: string) {
  const res = await apiFetch(`/api/marks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete marks');
  return res.json();
}

export async function createStudent(student: any) {
  const res = await apiFetch('/api/students', { method: 'POST', body: JSON.stringify(student) });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create student');
  }
  return res.json();
}

export async function updateStudent(id: string, student: any) {
  const res = await apiFetch(`/api/students/${id}`, { method: 'PUT', body: JSON.stringify(student) });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update student');
  }
  return res.json();
}

export async function deleteStudent(id: string) {
  const res = await apiFetch(`/api/students/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete student');
  }
  return res.json();
}

