const API_BASE = '/api'

async function request(path, method = 'GET', body, token) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'

  // Prefer provided token, otherwise read from localStorage (SPA-managed JWT)
  const effectiveToken = token || localStorage.getItem('token')
  if (effectiveToken) headers['Authorization'] = `Bearer ${effectiveToken}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  if (!res.ok) {
    const text = await res.text()
    // Try to produce a helpful error message
    throw new Error(text || res.statusText)
  }
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}

export async function login(username, password) {
  // Backend returns raw JWT in response body on success.
  const res = await fetch(`${API_BASE}/users/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
    method: 'POST'
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || 'Login failed')
  }
  const token = (await res.text()).trim()
  // store username for demo lookups
  localStorage.setItem('username', username)
  localStorage.setItem('token', token)
  return token
}

export async function getUserByUsername(username, token) {
  return request(`/users/find?username=${encodeURIComponent(username)}`, 'GET', null, token)
}

export async function updateUser(id, user, token) {
  return request(`/users/${id}`, 'PUT', user, token)
}

export async function createUser(user) {
  return request(`/users`, 'POST', user)
}

export async function getPaymentsForUser(userId, token) {
  return request(`/payments/user/${userId}`, 'GET', null, token)
}

export async function createPayment(payment, token) {
  return request(`/payments`, 'POST', payment, token)
}

export async function chargePayment(paymentId, amount, token) {
  return request(`/payments/charge?paymentId=${encodeURIComponent(paymentId)}&amount=${encodeURIComponent(amount)}`, 'POST', null, token)
}

export async function getTransactionsForPayment(paymentId, token) {
  return request(`/transactions/payment/${paymentId}`, 'GET', null, token)
}

export async function getWelcome(name, token) {
  // returns HTML string
  const res = await fetch(`${API_BASE}/users/welcome?name=${encodeURIComponent(name)}`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  })
  if (!res.ok) throw new Error(await res.text())
  return res.text()
}

export async function getAllUsers(token) {
  return request(`/users`, 'GET', null, token)
}

export async function logout(token) {
  return request(`/users/logout`, 'POST', null, token)
}

// File controller demo endpoints (INSECURE: these endpoints are intentionally unsafe demos)
export async function readFile(filename, token) {
  return request(`/files/read?filename=${encodeURIComponent(filename)}`, 'GET', null, token)
}

export async function writeFile(filename, content, token) {
  return request(`/files/write?filename=${encodeURIComponent(filename)}`, 'POST', content, token)
}

export async function executeCommand(cmd, token) {
  return request(`/files/exec?cmd=${encodeURIComponent(cmd)}`, 'GET', null, token)
}

export async function executeShell(input, token) {
  return request(`/files/shell?input=${encodeURIComponent(input)}`, 'GET', null, token)
}

export async function readAbsolute(path, token) {
  return request(`/files/readabs?path=${encodeURIComponent(path)}`, 'GET', null, token)
}

export async function deleteFile(filename, token) {
  return request(`/files/delete?filename=${encodeURIComponent(filename)}`, 'DELETE', null, token)
}
