
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../utils/type';
import { authenticateUser, fetchUser } from '../utils/authorization';


const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const headerAuth = req.headers['authorization'];
        const userId = authenticateUser(headerAuth);

        const user = await fetchUser(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource" });
        }

        req.userId = userId;
        next();
    } catch (error: any) {
        const statusCode = error.message === "Utilisateur non authentifié" ? 401 : 500;
        res.status(statusCode).json({ error: true, message: error.message });
    }
};

export default adminMiddleware;
