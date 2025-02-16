import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class ReportsVehicles extends Model {}

ReportsVehicles.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "reportsVehicles", tableName: "reports_vehicles", timestamps: false }
);