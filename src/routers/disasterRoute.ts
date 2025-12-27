import express, { Router } from 'express';
import { DisasterController } from '../controllers/disasterController';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

export class DisasterRoutes {
    public router: Router;
    private disasterController: DisasterController;
    constructor() {
        this.router = express.Router()
        this.disasterController = new DisasterController();
        this.configRoutes();
    }

    private configRoutes() {
        this.router.post('/import',upload.single('file'), this.disasterController.importJson.bind(this.disasterController));
        this.router.get('/stats', this.disasterController.getStatistics.bind(this.disasterController));
        this.router.get("/details",  this.disasterController.getCountryDetails.bind(this.disasterController));
    }
}