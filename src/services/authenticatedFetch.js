export const authenticatedFetch = async (
  url,
  options = {},
  accessToken,
  setAccessToken
) => {
  const buildHeaders = (token) => {
    const headers = {
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  if (!accessToken) {
    const responseRefresh = await fetch(
      'https://order-management-system-995e.onrender.com/api/auth/refresh',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-type': 'application/json',
        },
      }
    )

    if (!responseRefresh.ok) {
      return responseRefresh
    }

    const dataRefresh = await responseRefresh.json()
    setAccessToken(dataRefresh.accessToken)

    return await fetch(url, {
      ...options,
      headers: buildHeaders(dataRefresh.accessToken),
      credentials: 'include',
    })
  }

  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(accessToken),
    credentials: 'include',
  })

  if (response.status !== 401) {
    return response
  }

  const responseRefresh = await fetch(
    'https://order-management-system-995e.onrender.com/api/auth/refresh',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    }
  )

  if (!responseRefresh.ok) {
    return response
  }

  const dataRefresh = await responseRefresh.json()
  setAccessToken(dataRefresh.accessToken)

  return await fetch(url, {
    ...options,
    headers: buildHeaders(dataRefresh.accessToken),
    credentials: 'include',
  })
}
