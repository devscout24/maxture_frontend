import { jwtDecode, type JwtPayload } from "jwt-decode"

const isValidToken = (token: string) => {
  try {
    const decodedToken = jwtDecode<JwtPayload>(token)
    const currentTime = Date.now() / 1000

    return (
      typeof decodedToken.exp === "number" && decodedToken.exp > currentTime
    )
  } catch {
    return false
  }
}

export default isValidToken
