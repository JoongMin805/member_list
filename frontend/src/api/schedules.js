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

export const getSchedules = () => request('/schedules')
export const getSchedule = (id) => request(`/schedules/${id}`)
export const createSchedule = (body) =>
  request('/schedules', { method: 'POST', body: JSON.stringify(body) })
export const updateSchedule = (id, body) =>
  request(`/schedules/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteSchedule = (id) =>
  request(`/schedules/${id}`, { method: 'DELETE' })
