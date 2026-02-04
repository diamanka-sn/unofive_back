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
// async importGeoJson(geoJsonData: any): Promise<any> {
//     const features = geoJsonData.features;
//     const results = [];

//     for (const feature of features) {
//       const { fid, ADM0_A3_MA, name } = feature.properties;
//       const geometry = JSON.stringify(feature.geometry);

//       const result = await this.repository
//         .createQueryBuilder()
//         .insert()
//         .into(Country)
//         .values({
//           fid: fid,
//           adm0Code: ADM0_A3_MA || feature.properties.ADM0_A3_MA,
//           name: name || feature.properties.NAME,
//           geom: () => `ST_GeomFromGeoJSON('${geometry}')`
//         })
//         .orUpdate(["adm0Code", "name", "geom"], ["fid"])
//         .execute();
      
//       results.push(result);
//     }
//     return results;
//   }
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
