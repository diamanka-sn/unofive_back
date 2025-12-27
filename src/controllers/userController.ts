import { AppDataSource } from "../data-source";
import { User } from "../models/user";
import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import AuthService from './../utils/jwt.utils';
import { AuthRequest } from "../utils/type";
import { UserService } from "../services/UserService";
export class UserController {
    private userService!: UserService;

    constructor() {
        AppDataSource.initialize()
            .then(async () => {
                this.userService = new UserService(AppDataSource.getRepository(User));
            })
            .catch((error) => console.log(error));
    }

    async getAll(req: Request, res: Response) {
        try {
            const list_events = await this.userService.getAll({});
            res.json(list_events)
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'L\'adresse email et le mot de passe sont requis.' });
        }

        try {
            const user = await this.userService.getByFilter({ email });

            if (!user) {
                return res.status(401).json({ message: 'Adresse email incorrecte.' });
            }

            const passwordVerif = await bcrypt.compare(password, user.password);

            if (!passwordVerif) {
                return res.status(401).json({ message: 'Mot de passe incorrect.' });
            }

            const token = AuthService.generateTokenForUser(user);
            return res.status(200).json({ user, token });
        } catch (error) {
            return res.status(500).json({ message: 'Erreur serveur.' });
        }
    }

    async register(req: Request, res: Response) {
        try {
            const hashedPassword = bcrypt.hashSync(req.body.password, 10);
            const verif = await this.userService.getByFilter({ email: req.body.email })
            if (verif) {
                return res.status(401).json({ message: 'Adresse email existe déjà.' });
            }
            const user = new User()
            user.email = req.body.email
            user.nom = req.body.nom
            user.isAdmin = req.body.isAdmin
            user.password = hashedPassword

            const createdUser = await this.userService.create(user)

            const token = AuthService.generateTokenForUser(createdUser);
            return res.status(200).json({ user, token });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateUser(req: AuthRequest, res: Response) {
        try {
            const user = req.body
            const u: User = await this.userService.getById({ id: req.userId })

            if (!u) {
                return res.status(404).json({ message: 'Utilisateur introuvable' });
            }

            u.email = user.email ? user.email : u.email
            u.nom = user.nom ? user.nom : u.nom

            const updateUser = await this.userService.update({ id: req.userId }, u)
            res.json(updateUser)
        } catch (error: any) {
            res.status(500).json({ message: error.message })
        }
    }
   
    
    async userImage(req: AuthRequest, res: Response) {
        const file = req.file;
        if (!file) {
            return res.status(400).send({ message: 'Veuillez télécharger une image' });
        }

        try {
            const user = await this.userService.getById({ id: req.userId });
            if (!user) {
                return res.status(404).send({ message: 'Utilisateur introuvable' });
            }

            user.imageUrl = file.path;
            const updateUser = await this.userService.update({ id: req.userId }, user);
            res.json(updateUser);
        } catch (error: any) {
            console.log(error)
            res.status(500).json({ message: error.message });
        }
    }
}