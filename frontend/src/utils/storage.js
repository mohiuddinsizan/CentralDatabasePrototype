export const AUTH_KEY = "central_admin_auth";
export const QUESTION_FORM_DEFAULTS_KEY = "question_form_defaults";

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

export const getQuestionDefaults = () => {
  const raw = localStorage.getItem(QUESTION_FORM_DEFAULTS_KEY);
  return raw
    ? JSON.parse(raw)
    : {
        defaultMcqOptionCount: 4,
        defaultCqPartCount: 2,
      };
};

export const setQuestionDefaults = (data) => {
  localStorage.setItem(QUESTION_FORM_DEFAULTS_KEY, JSON.stringify(data));
};