class HttpService {
  private getHeaders(optionsHeaders: Record<string, string> = {}): Record<string, string> {
    const token = localStorage.getItem("sms_token");
    const academicYear = localStorage.getItem("sms_active_academic_year");
    const academicYearId = localStorage.getItem("sms_academic_year_id");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(academicYearId ? { "X-Academic-Year-Id": academicYearId, "academicyearid": academicYearId } : {}),
      ...optionsHeaders,
    };
    return headers;
  }

  private formatUrl(url: string): string {
    const schoolId = localStorage.getItem("sms_active_school_id");
    let finalUrl = url;
    if (schoolId && finalUrl.startsWith("/api/") && !finalUrl.startsWith("/api/schools")) {
      finalUrl = finalUrl.replace(/^\/api\//, `/api/${schoolId}/`);
    }
    return finalUrl;
  }

  async get<T = any>(url: string, headers: Record<string, string> = {}): Promise<T> {
    const res = await fetch(this.formatUrl(url), {
      method: "GET",
      headers: this.getHeaders(headers),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${res.status}`);
    }
    return res.json();
  }

  async post<T = any>(url: string, body?: any, headers: Record<string, string> = {}): Promise<T> {
    const isFormData = body instanceof FormData;
    const reqHeaders = this.getHeaders(headers);
    if (isFormData) {
      delete reqHeaders["Content-Type"];
    }

    const res = await fetch(this.formatUrl(url), {
      method: "POST",
      headers: reqHeaders,
      body: isFormData ? body : JSON.stringify(body),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${res.status}`);
    }
    return res.json();
  }

  async put<T = any>(url: string, body?: any, headers: Record<string, string> = {}): Promise<T> {
    const isFormData = body instanceof FormData;
    const reqHeaders = this.getHeaders(headers);
    if (isFormData) {
      delete reqHeaders["Content-Type"];
    }

    const res = await fetch(this.formatUrl(url), {
      method: "PUT",
      headers: reqHeaders,
      body: isFormData ? body : JSON.stringify(body),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${res.status}`);
    }
    return res.json();
  }

  async delete<T = any>(url: string, headers: Record<string, string> = {}): Promise<T> {
    const res = await fetch(this.formatUrl(url), {
      method: "DELETE",
      headers: this.getHeaders(headers),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${res.status}`);
    }
    return res.json();
  }
}

const httpService = new HttpService();
export default httpService;
