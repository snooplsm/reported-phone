import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class RideshareBase extends Model {}

RideshareBase.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    number: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "rideshareBase", tableName: "rideshare_bases", timestamps: false }
);