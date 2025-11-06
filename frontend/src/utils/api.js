/**
 * Wrapper fetch API agar otomatis refresh session
 */
export const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  return response.json();
};
