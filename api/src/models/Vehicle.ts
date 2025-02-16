import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class Vehicle extends Model {}

Vehicle.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    make: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    year: { type: DataTypes.INTEGER, validate: { min: 1886 } },
    plate: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING(2) },
    plate_image_url: { type: DataTypes.STRING },
    car_image_url: { type: DataTypes.STRING },
    vin: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING },
  },
  { sequelize, modelName: "vehicle", tableName: "vehicles", timestamps: false }
);

