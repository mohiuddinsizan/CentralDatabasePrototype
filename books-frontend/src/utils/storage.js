export const AUTH_KEY = "books_admin_auth";

export const getStoredAuth = () => {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setStoredAuth = (data) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(AUTH_KEY);
};