import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class Location extends Model {

  declare id:number
  
  public neighborhoods?: string[];

  // ✅ Return coordinates inside an object
  get coordinates(): { lat: number; lng: number } {
    const gometry = this.getDataValue("geometry")
    return {
      lat: (gometry as any).coordinates[1], // Y (Latitude)
      lng: (gometry as any).coordinates[0], // X (Longitude)
    };
  }
}

Location.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    geometry: {
      type: DataTypes.GEOMETRY("POINT"),
      allowNull: false,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    building_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    neighborhoods: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue("neighborhoods");
      },
    }
  },
  {
    sequelize,
    modelName: "location",
    timestamps: false,
  }
);