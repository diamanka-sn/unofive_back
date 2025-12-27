import { Repository } from "typeorm";
import { Country } from "../models/country";
import { AbstractService } from "./AbstarctService";

export class CountryService extends AbstractService<Country> {
  constructor(repository: Repository<Country>) {
    super(repository);
  }

  async importGeoJson(geoJsonData: any): Promise<Country[]> {
    const features = geoJsonData.features;

    const countriesToSave = features.map((feature: any) => {
      return {
        fid: feature.properties.fid,
        adm0Code: feature.properties.ADM0_A3_MA,
        name: feature.properties.NAME,
        geom: feature.geometry,
      };
    });

    return await this.repository.save(countriesToSave);
  }

  async getAllCountries() {
    return await this.repository
      .createQueryBuilder("country")
      .select(["country.name", "country.fid", "country.adm0Code"])
      .addSelect("ST_AsGeoJSON(country.geom)::json", "geom")
      .getRawMany();
  }

  async getCountryById(id: number) {
    return await this.repository
      .createQueryBuilder("country")
      .where("country.fid = :id", { id })
      .select(["country.name", "country.fid", "country.adm0Code"])
      .addSelect("ST_AsGeoJSON(ST_Centroid(country.geom))::json", "centroid")
      .getRawOne(); 
  }
}
