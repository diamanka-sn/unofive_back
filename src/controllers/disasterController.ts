import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import fs from "fs";
import { DisasterService } from "../services/DisasterService";
import { Disaster } from "../models/disaster";
export class DisasterController {
  private disasterService!: DisasterService;

  constructor() {
    AppDataSource.initialize()
      .then(async () => {
        this.disasterService = new DisasterService(
          AppDataSource.getRepository(Disaster)
        );
      })
      .catch((error) => console.log(error));
  }

 async importJson (req: Request, res: Response)  {
    try {
      if (!req.file) {
        return res.status(400).send({ message: "Fichier JSON manquant" });
      }

      const count = await this.disasterService.importFromJson(req.file.path);
      
      return res.status(200).send({
        message: `Importation réussie : ${count} catastrophes enregistrées.`
      });
    } catch (error: any) {
      return res.status(500).send({
        message: "Erreur lors de l'importation",
        error: error.message
      });
    }
  }

 async getStatistics(req: Request, res: Response) {
  try {
    const year = parseInt(req.query.year as string) || 2024;
    const type = req.query.type as string;

    const stats = await this.disasterService.getMapStats(year, type);
    
    const geoJson = {
      type: "FeatureCollection",
      features: stats.map(s => ({
        type: "Feature",
        id: s.fid,
        geometry: s.geometry,
        properties: {
          fid: s.fid,
          name: s.name,
          iso: s.iso,
          event_count: parseInt(s.event_count) || 0,
          total_deaths: parseFloat(s.total_deaths) || 0,
          total_affected: parseFloat(s.total_affected) || 0
        }
      }))
    };

    return res.status(200).json(geoJson);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

async getCountryDetails(req: Request, res: Response) {
  try {
    const fid = parseInt(req.query.fid as string);
    if (!fid) return res.status(400).json({ message: "FID du pays manquant" });

    const details = await this.disasterService.getCountryDetailedStats(fid);
    return res.status(200).json(details);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

async bulkImport(req: Request, res: Response) {
  try {
    const { data } = req.body; 

    if (!data) {
      return res.status(400).json({ message: "Le corps de la requête doit contenir un champ 'data'." });
    }

    const count = await this.disasterService.bulkImport(data);

    return res.status(200).json({
      message: `Importation réussie : ${count} catastrophes synchronisées dans PostGIS.`,
      status: 'success'
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Erreur lors du traitement massif des données",
      error: error.message
    });
  }
}
}