import { Request, Response } from "express";
import { CountryService } from "../services/ContryService";
import { AppDataSource } from "../data-source";
import { Country } from "../models/country";
import fs from "fs";
export class CountryController {
  private countryService!: CountryService;

  constructor() {
    AppDataSource.initialize()
      .then(async () => {
        this.countryService = new CountryService(
          AppDataSource.getRepository(Country)
        );
      })
      .catch((error) => console.log(error));
  }

  // async uploadGeoJson(req: Request, res: Response) {
  //   try {
  //     const file = req.file;
  //     if (!file) {
  //       return res.status(400).json({ message: "Aucun fichier GeoJSON reçu" });
  //     }

  //     const fileContent = fs.readFileSync(file.path, "utf-8");
  //     const geoData = JSON.parse(fileContent);
  //     if (!geoData || geoData.type !== "FeatureCollection") {
  //       fs.unlinkSync(file.path);
  //       return res.status(400).json({ message: "Format GeoJSON invalide" });
  //     }

  //     const result = await this.countryService.importGeoJson(geoData);

  //     fs.unlinkSync(file.path);

  //     return res.status(201).json({
  //       message: "Importation réussie",
  //       count: result.length,
  //     });
  //   } catch (error) {
  //     if (req.file) fs.unlinkSync(req.file.path);

  //     console.error(error);
  //     return res.status(500).json({ message: "Erreur lors de l'import" });
  //   }
  // }

  async uploadGeoJson(req: Request, res: Response) {
  try {
    const geoDataChunk = req.body; 

    if (!geoDataChunk || !geoDataChunk.length) {
      return res.status(400).json({ message: "Données vides" });
    }

    const wrapper = {
      type: "FeatureCollection",
      features: geoDataChunk
    };

    const result = await this.countryService.importGeoJson(wrapper);

    return res.status(201).json({
      message: "Synchronisation réussie",
      count: result.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur lors de la synchronisation PostGIS" });
  }
}

  async getCountries(req: Request, res: Response) {
    try {
      const data = await this.countryService.getAllCountries();

      const geojson = {
        type: "FeatureCollection",
        features: data.map((item) => ({
          type: "Feature",
          properties: {
            
            name: item.country_name,
            adm0Code: item.country_adm0Code,
            fid: item.country_fid,
          },
          geometry: item.geom,
        })),
      };
      return res.status(200).json(geojson);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération des pays" });
    }
  }

  async getOneCountry(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const item = await this.countryService.getCountryById(id);

      if (!item) {
        return res.status(404).json({ message: "Pays non trouvé" });
      }

      const feature = {
        type: "Feature",
        properties: {
          name: item.country_name,
          adm0Code: item.country_adm0Code,
          fid: item.country_fid,
        },
        geometry: item.geom,
      };

      return res.status(200).json(feature);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erreur lors de la récupération du pays" });
    }
  }
}
