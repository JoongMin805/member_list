const API_BASE_URL =
  window.APP_CONFIG?.API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

if (!API_BASE_URL) {
  throw new Error("API_URL이 설정되지 않았습니다");
}

const request = async (url, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'API 오류')
  return data
}

export const getMembers = () => request('/members')
export const getMember = (id) => request(`/members/${id}`)
export const createMember = (body) =>
  request('/members', { method: 'POST', body: JSON.stringify(body) })
export const updateMember = (id, body) =>
  request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteMember = (id) =>
  request(`/members/${id}`, { method: 'DELETE' })
export const initParticipationAll = () =>
  request('/members/init-participation', {
    method: 'POST'
})
