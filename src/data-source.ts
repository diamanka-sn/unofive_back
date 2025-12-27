import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./models/user"
import dotenv from "dotenv";
import { Country } from "./models/country";
import { Disaster } from "./models/disaster";



dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.HOST_DB || "localhost",
    port: Number(process.env.PORT_DB) || 5432,
    username: process.env.USER_DB || "postgres",
    password: process.env.PASSWORD_DB || "",
    database: process.env.DB_NAME || "unofive_db",
    synchronize: false,
    logging: false,
    entities: [User, Country, Disaster],
    migrations: ["src/migrations/*.ts"],
    subscribers: []
})