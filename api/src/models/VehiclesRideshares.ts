import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class VehiclesRideshares extends Model {}

VehiclesRideshares.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    license_type: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    license_number: { type: DataTypes.STRING, unique: true },
    status: { type: DataTypes.STRING },
    expiration_date: { type: DataTypes.DATE },
    last_updated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "vehiclesRideshares", tableName: "vehicles_rideshares", timestamps: false }
);