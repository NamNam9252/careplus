/**
 * JWT Utility Functions
 * Handles token extraction and decoding from httpOnly cookies
 */

/**
 * Decodes a JWT token to extract user information
 * Note: This is a basic decoder for non-sensitive operations
 * The actual verification happens on the server side
 */
export function decodeJWTToken(token: string): any {
  try {
    // JWT is composed of three parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Extracts JWT token from httpOnly cookies
 * Note: This only works on the server side as httpOnly cookies
 * cannot be accessed from client-side JavaScript
 */
export function getTokenFromCookies(cookieString: string): string | null {
  try {
    const cookies = cookieString.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    // NextAuth session token name
    const sessionToken = cookies['next-auth.session-token'] || 
                        cookies['__Secure-next-auth.session-token'];
    
    return sessionToken || null;
  } catch (error) {
    console.error('Error extracting token from cookies:', error);
    return null;
  }
}

/**
 * Gets user info from session token on the server
 * This should be called from server components or API routes
 */
export async function getUserInfoFromToken(cookieString: string): Promise<any> {
  const token = getTokenFromCookies(cookieString);
  if (!token) {
    return null;
  }
  
  return decodeJWTToken(token);
}
