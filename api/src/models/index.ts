import { sequelize } from "../database";
import { Report } from "./Report";
import { Location } from "./Location";
import { S3File } from "./S3File";
import { ReportFile } from "./ReportFile";

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

// console.log("ALL ASSOCIATIONS")
// console.log(Report.associations); // ✅ Prints all registered associations
// console.log(Location.associations);
export { sequelize, Report, Location, S3File, ReportFile };