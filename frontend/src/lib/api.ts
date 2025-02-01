export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('habit_bank_admin_token') : null;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(adminToken ? { "X-Admin-Token": adminToken } : {}),
        ...options.headers,
      },
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      let errorMessage = `API error: ${res.status}`;
      
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else {
          errorMessage = JSON.stringify(errorData.detail);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    if (res.status === 204) return null;
    return await res.json();
  } catch (error) {
    console.error(`Fetch failed for ${url}:`, error);
    throw error;
  }
}
