import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { UserRoutes } from "./routers/userRoute";
dotenv.config();

import http from 'http';
import { CountryRoute } from "./routers/countryRoute";
import { DisasterRoutes } from "./routers/disasterRoute";

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization,multipart/form-data"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const userRoutes = new UserRoutes();
const countryRoutes = new CountryRoute();
const disasterRoutes = new DisasterRoutes();


app.use("/api/users", userRoutes.router);
app.use("/api/countries", countryRoutes.router);
app.use("/api/disasters", disasterRoutes.router);

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});