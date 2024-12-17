/** @format */

interface JwtPayload {
  _id: string;
  accountType: string;
  status: string;
  iat: number;
  exp: number;
}

export default JwtPayload;