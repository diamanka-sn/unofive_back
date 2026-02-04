import express, { Router } from 'express';
import { CountryController } from '../controllers/countryController';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
export class CountryRoute {
    public router: Router;
    private countryController: CountryController;
    constructor() {
        this.router = express.Router()
        this.countryController = new CountryController();
        this.configRoutes();
    }

    private configRoutes() {
        // this.router.post('/upload', upload.single('file'), this.countryController.uploadGeoJson.bind(this.countryController));
       this.router.post('/sync', this.countryController.uploadGeoJson.bind(this.countryController));
        this.router.get('/', this.countryController.getCountries.bind(this.countryController));
        this.router.get('/:id', this.countryController.getOneCountry.bind(this.countryController));
    }
}