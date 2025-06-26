import jwt_decode from 'jwt-decode';

interface JwtPayload {
  exp: number; // UNIX timestamp
  [key: string]: any;
}
export function isTokenExpired(token: string): boolean {
  try {
    const decoded: JwtPayload = jwt_decode(token);
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If there's an error, assume the token is expired
  }
}