import { DataTypes, Model, Sequelize, WhereOptions } from "sequelize";
import { sequelize } from "../database.js";
import { S3File } from "./S3File.js";
import { Location } from "./Location.js"

export class Report extends Model {

  static async findAllWithLocations(where: WhereOptions<Report> = {}) {
    return await Report.findAll({
      where, // ✅ Uses `{}` if no condition is passed
      include: [
        {
          model: Location,
          attributes: {
            include: [
              [
                Sequelize.literal(`(
                  SELECT ARRAY_AGG(name) FROM neighborhoods 
                  WHERE ST_Contains(neighborhoods.geojson, location.geometry)
                )`),
                "neighborhoods",
              ],
            ],
          },
        },
        { model: S3File, as: "files", required: false },
      ],
    });
  }
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
      references: { model: "location", key: "id" }, // Foreign key reference
      onDelete: "CASCADE",
    },
    created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "report", timestamps: false }
);