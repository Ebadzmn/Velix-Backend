import { NextFunction, Request, Response } from 'express';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelper } from '../../helpers/jwtHelper';

const auth = (...requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(401, 'You are not authorized');
      }

      const tokenValue = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

      const verifiedUser = jwtHelper.verifyToken(tokenValue, config.jwt.secret);

      req.user = verifiedUser;

      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(403, 'Forbidden access!');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
