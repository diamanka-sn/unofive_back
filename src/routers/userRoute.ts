import express, { Router } from 'express';
import { UserController } from '../controllers/userController';

export class UserRoutes {
    public router: Router;
    private userController: UserController;
    constructor() {
        this.router = express.Router()
        this.userController = new UserController();
        this.configRoutes();
    }

    private configRoutes() {
        this.router.post('/login', this.userController.login.bind(this.userController));
        this.router.post('/register', this.userController.register.bind(this.userController));
        // this.router.put('/', authMiddleware, this.userController.updateUser.bind(this.userController));
        // this.router.put('/preferences', authMiddleware, this.userController.updateUserPreference.bind(this.userController));
        // this.router.post('/upload', authMiddleware, upload.single('file'), this.userController.userImage.bind(this.userController));

    }
}