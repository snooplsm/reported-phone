import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";

class Neighborhood extends Model {}

Neighborhood.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true, // Ensures unique neighborhood names
      allowNull: false,
    },
    geojson: {
      type: DataTypes.JSONB, // Store raw GeoJSON as JSONB
      field: "geojson_str",
      allowNull: false,      
    },
    geojson_geometry: {        
        type: DataTypes.GEOMETRY("MULTIPOLYGON", 4326), // PostGIS Geometry
        allowNull: false,
        field: "geojson"
      },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,      
    },
  },
  {
    sequelize,
    tableName: "neighborhoods",
    timestamps: false, // Disables `updatedAt`
    underscored: true
  }
);

export default Neighborhood;