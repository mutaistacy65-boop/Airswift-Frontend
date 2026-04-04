const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiFetch = async (url, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: 'include',
  });

  if (res.status === 401) {
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await refreshRes.json();

    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      return apiFetch(url, options);
    }
  }

  return res.json();
};
