import { Repository } from "typeorm";
import { AbstractService } from "./AbstarctService";
import { Disaster } from "../models/disaster";
import fs from "fs";
import { Country } from "../models/country";

export class DisasterService extends AbstractService<Disaster> {
  constructor(repository: Repository<Disaster>) {
    super(repository);
  }

  private parseSafeInt(value: any): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : Math.round(parsed);
  }

  private parseSafeFloat(value: any): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  async importFromJson(filePath: string): Promise<number> {
    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(rawData); 

      if (!Array.isArray(jsonData)) {
        throw new Error("Le format JSON doit être un tableau d'objets.");
      }

      const cleanData = jsonData
        .filter(item => item.disno && item.disno.trim() !== "") 
        .map(item => ({
          ...item,
          year: this.parseSafeInt(item.year),
          deaths: this.parseSafeInt(item.deaths),
          injured: this.parseSafeInt(item.injured),
          affected: this.parseSafeInt(item.affected),
          homeless: this.parseSafeInt(item.homeless),
          total_affected: this.parseSafeInt(item.total_affected),
          fid: this.parseSafeInt(item.fid),
          damage_usd: this.parseSafeFloat(item.damage_usd),
          cpi: this.parseSafeFloat(item.cpi),
          start_date: item.start_date || null,
          end_date: item.end_date || null,
        }));

      const chunkSize = 500;
      for (let i = 0; i < cleanData.length; i += chunkSize) {
        const chunk = cleanData.slice(i, i + chunkSize);
        await this.repository.upsert(chunk, ['disno']);
      }

      fs.unlinkSync(filePath);
      return cleanData.length;

    } catch (error) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      throw error;
    }
  }

  async getMapStats(year: number, disasterType?: string) {
  const query = this.repository.manager.createQueryBuilder(Country, "country")
    .select([
      "country.fid as fid",
      "country.name as name",
      "disaster.iso as iso",
      "ST_AsGeoJSON(country.geom)::json as geometry", 
      "COALESCE(SUM(disaster.deaths), 0) as total_deaths",
      "COALESCE(SUM(disaster.total_affected), 0) as total_affected",
      "COUNT(disaster.id) as event_count"
    ]);

  let joinCondition = "disaster.fid = country.fid AND disaster.year = :year";
  const parameters: any = { year };

  if (disasterType && disasterType !== 'all') {
    joinCondition += " AND disaster.disaster_type = :disasterType";
    parameters.disasterType = disasterType;
  }

  return query
    .leftJoin("disasters", "disaster", joinCondition, parameters)
    .groupBy("country.fid, country.name,disaster.iso, country.geom")
    .getRawMany();
}

async getCountryDetailedStats(fid: number) {
  const summary = await this.repository.createQueryBuilder("disaster")
    .where("disaster.fid = :fid", { fid })
    .select([
      "COUNT(disaster.id) as total_events",
      "SUM(disaster.deaths) as total_deaths",
      "SUM(disaster.damage_usd) as total_damage",
      "AVG(disaster.cpi) as avg_cpi",
      "MAX(disaster.total_affected) as max_intensity",
      "SUM(disaster.injured) as total_injured",
      "SUM(disaster.homeless) as total_homeless",
      "SUM(disaster.total_affected) as total_affected_sum",
      "AVG(disaster.end_date - disaster.start_date) as avg_duration_days"
    ])
    .getRawOne();

  const subgroupDist = await this.repository.createQueryBuilder("disaster")
    .where("disaster.fid = :fid", { fid })
    .select("disaster.subgroup", "subgroup")
    .addSelect("COUNT(disaster.id)", "count")
    .groupBy("disaster.subgroup")
    .getRawMany();

  const dominantType = await this.repository.createQueryBuilder("disaster")
    .where("disaster.fid = :fid", { fid })
    .select("disaster.disaster_type", "type")
    .addSelect("COUNT(disaster.id)", "count")
    .groupBy("disaster.disaster_type")
    .orderBy("count", "DESC")
    .limit(1)
    .getRawOne();

  const trend = await this.repository.createQueryBuilder("disaster")
    .where("disaster.fid = :fid", { fid })
    .select([
      "disaster.year as year",
      "SUM(disaster.damage_usd) as annual_damage",
      "AVG(disaster.cpi) as annual_cpi",
      "SUM(disaster.deaths) as annual_deaths"
    ])
    .groupBy("disaster.year")
    .orderBy("disaster.year", "ASC")
    .getRawMany();

  return {
    overview: {
      total_events: parseInt(summary.total_events) || 0,
      total_deaths: parseFloat(summary.total_deaths) || 0,
      total_damage: parseFloat(summary.total_damage) || 0,
      avg_cpi: parseFloat(summary.avg_cpi) || 0,
      max_intensity: parseInt(summary.max_intensity) || 0,
      dominant_type: dominantType?.type || "N/A",
      annual_frequency: (parseInt(summary.total_events) / 25).toFixed(2),
      avg_duration: summary.avg_duration_days ? parseFloat(summary.avg_duration_days).toFixed(1) : "0",
    },
    vulnerability: {
      total_injured: parseInt(summary.total_injured) || 0,
      total_homeless: parseInt(summary.total_homeless) || 0,
      total_affected: parseInt(summary.total_affected_sum) || 0,
      subgroups: subgroupDist
    },
    chart_data: trend
  };
}


async bulkImport(data: any[]): Promise<number> {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Données invalides : un tableau non vide est requis.");
  }

  const cleanData = data.map(item => ({
    disno: item.disno,
    year: this.parseSafeInt(item.year),
    iso: item.iso,
    country: item.country,
    group: item.group,
    subgroup: item.subgroup,
    disaster_type: item.disaster_type,
    disaster_subtype: item.disaster_subtype,
    deaths: this.parseSafeInt(item.deaths),
    damage_usd: this.parseSafeFloat(item.damage_usd),
    injured: this.parseSafeInt(item.injured),
    affected: this.parseSafeInt(item.affected),
    homeless: this.parseSafeInt(item.homeless),
    total_affected: this.parseSafeInt(item.total_affected),
    cpi: this.parseSafeFloat(item.cpi),
    fid: this.parseSafeInt(item.fid),
    start_date: item.start_date || null,
    end_date: item.end_date || null,
    entry_date: item.entry_date,
    last_update: item.last_update
  }));

  const chunkSize = 500;
  for (let i = 0; i < cleanData.length; i += chunkSize) {
    const chunk = cleanData.slice(i, i + chunkSize);
    await this.repository.upsert(chunk, ['disno']);
  }

  return cleanData.length;
}
}