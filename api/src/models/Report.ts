import { DataTypes, Model } from "sequelize";
import { sequelize } from "../database";

export class Report extends Model {
  public id!: number;
  public complaint!: string;
  public time!: Date;
  public location_id!: number;
  public readonly created!: Date;
}

Report.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    complaint: {
      type: DataTypes.ENUM("blocked bike lane", "blocked crosswalk", "missing crosswalk"),
      allowNull: false,
    },
    time: { type: DataTypes.DATE, allowNull: false },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "locations", key: "id" }, // Foreign key reference
      onDelete: "CASCADE",
    },
    created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "report", timestamps: false }
);