import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class ReportFile extends Model {
  public id!: number;
  public report_id!: number;
  public file_id!: string;
  public type!: string;
  public readonly created!: Date
}

ReportFile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    report_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "reports", key: "id" },
      onDelete: "CASCADE",
    },
    file_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "s3_files", key: "id" },
      onDelete: "CASCADE",
    },
    type: {
      type: DataTypes.ENUM("image", "video", "document", "audio", "other"),
      allowNull: false,
    },
    created: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "report_file",
    timestamps: false,
  }
);

export default ReportFile