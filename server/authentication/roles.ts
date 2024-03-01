import type { Response } from 'express'
import { jwtDecode } from 'jwt-decode'

const MAINTAINER_ROLE = 'ROLE_HMPPS_REGISTERS_MAINTAINER'

const extractRoles = (res: Response): Array<string> => {
  const token = res?.locals?.user?.token
  const decodedToken = token && (jwtDecode(res.locals.user.token) as { authorities?: string[] })
  return (decodedToken && decodedToken.authorities) || []
}

export { MAINTAINER_ROLE, extractRoles }
