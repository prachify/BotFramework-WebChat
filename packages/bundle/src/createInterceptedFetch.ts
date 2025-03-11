function createInterceptedFetch(originalFetch: typeof window.fetch, fetchOptions?: { [key: string]: any }) {
  return async function customFetch(url, options) {
    const urlObj = new URL(url, window.location.origin);
    // Modify request (optional)
    if (urlObj.hostname === fetchOptions.hostname) {
      options.headers['directline_token'] = fetchOptions.authorizationToken;
    }

    const response = await originalFetch(url, options);

    return response;
  };
}
export default createInterceptedFetch;
