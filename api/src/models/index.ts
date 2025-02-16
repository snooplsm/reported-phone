import { sequelize } from "../database.js";
import { Report } from "./Report.js";
import { Location } from "./Location.js";
import { S3File } from "./S3File.js";
import { ReportFile } from "./ReportFile.js";
import { Vehicle } from "./Vehicle.js";
import { ReportsVehicles } from "./ReportsVehicles.js"
import { RideshareBase } from "./RideshareBase.js";
import { VehiclesRideshares } from "./VehiclesRideshares.js";

Report.belongsTo(Location, { foreignKey: "location_id", onDelete: "CASCADE" });
Location.hasMany(Report, { foreignKey: "location_id", onDelete: "CASCADE" });
// Report.hasMany(ReportFile, { foreignKey: "report_id", onDelete: "CASCADE" });
ReportFile.belongsTo(Report, { foreignKey: "report_id", onDelete: "CASCADE" });
Report.belongsToMany(S3File, {
    through: ReportFile, // ✅ Use ReportFile as a join table
    foreignKey: "report_id",
    otherKey: "file_id",
    as: "files" // ✅ Treat S3File as "files" directly in Report
  });
  
S3File.belongsToMany(Report, {
    through: ReportFile,
    foreignKey: "file_id",
    otherKey: "report_id",
    as: "reports" // ✅ Allows querying Reports from S3File
});

ReportFile.belongsTo(S3File, { foreignKey: "file_id", as: 's3_file', onDelete: "CASCADE" });
S3File.hasMany(ReportFile, { foreignKey: "file_id", onDelete: "CASCADE" });

Vehicle.belongsToMany(Report, { through: ReportsVehicles, foreignKey: "vehicle_id" });
Report.belongsToMany(Vehicle, { through: ReportsVehicles, foreignKey: "report_id" });

// 🚕 Many-to-One: VehiclesRideshares → Vehicles
VehiclesRideshares.belongsTo(Vehicle, { foreignKey: "vehicle_id", onDelete: "CASCADE" });
Vehicle.hasMany(VehiclesRideshares, { foreignKey: "vehicle_id" });

// 🚖 Many-to-One: VehiclesRideshares → RideshareBase
VehiclesRideshares.belongsTo(RideshareBase, { foreignKey: "base_id", onDelete: "SET NULL" });
RideshareBase.hasMany(VehiclesRideshares, { foreignKey: "base_id" });

export { sequelize, Report, Location, S3File, ReportFile, Vehicle, ReportsVehicles, RideshareBase, VehiclesRideshares };