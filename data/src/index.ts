const { Client } = require("pg");
const axios = require("axios");
const fs = require("fs");

// 🔹 PostgreSQL Connection Configuration
const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function importLocations() {
    try {
        await client.connect();
        console.log("✅ Connected to PostgreSQL");
        await importNeighborhoods()
        await importZipcodes()
    } finally {
        client.end()
    }
}

async function importNeighborhoods() {
    try {



        // 🔹 Download GeoJSON File
        const geojsonPath = "data/philadelphia.geojson";
        const data = JSON.parse(fs.readFileSync(geojsonPath, "utf-8"));

        // 🔹 Loop Through Each Neighborhood and Insert into DB
        for (const feature of data.features) {
            const name = feature.properties?.name || "Unknown"; // Extract name
            const geojsonGeometry = JSON.stringify(feature.geometry); // Convert to JSON string

            // Insert into PostgreSQL
            const query = `
            WITH existing AS (
                SELECT id FROM neighborhoods 
                WHERE ST_Equals(geojson, ST_GeomFromGeoJSON($2))
                LIMIT 1
            )
            INSERT INTO neighborhoods (name, geojson, geojson_str)
            SELECT $1, ST_GeomFromGeoJSON($2), $2::jsonb
            WHERE NOT EXISTS (SELECT 1 FROM existing)
            ON CONFLICT (name) DO UPDATE 
            SET geojson = ST_GeomFromGeoJSON($2),
                geojson_str = $2::jsonb;
            `;
            // console.log(geojsonGeometry)
            await client.query(query, [name, geojsonGeometry]);
            console.log(`✅ Inserted: ${name}`);
        }

        console.log("🎉 Import completed successfully!");
    } catch (err) {
        console.error("❌ Error importing neighborhoods:", err);
    }
}

async function importZipcodes() {
    try {

        // 🔹 Load ZIP Code GeoJSON File
        const geojsonPath = "data/pa_zipcodes.geojson"; // Change path as needed
        const data = JSON.parse(fs.readFileSync(geojsonPath, "utf-8"));

        // 🔹 Loop Through Each ZIP Code Feature
        for (const feature of data.features) {
            const props = feature.properties;
            const zipcode = props.ZCTA5CE10; // ZIP Code
            const stateFips = props.STATEFP10; // State FIPS
            const geoid = props.GEOID10; // Unique identifier
            const classFp = props.CLASSFP10; // Classification
            const mtfcc = props.MTFCC10; // MAF/TIGER Feature Code
            const funcStat = props.FUNCSTAT10; // Functional status
            const landArea = props.ALAND10; // Land area
            const waterArea = props.AWATER10; // Water area
            const centroidLat = parseFloat(props.INTPTLAT10); // Latitude
            const centroidLon = parseFloat(props.INTPTLON10); // Longitude
            // Ensure all geometries are MultiPolygon
            let geometry = feature.geometry;
            if (geometry.type === "Polygon") {
                geometry = {
                    type: "MultiPolygon",
                    coordinates: [geometry.coordinates], // Wrap in an array to conform to MultiPolygon format
                };
            }

            const geojsonGeometry = JSON.stringify(geometry); // Convert geometry to JSON string

            // Insert into PostgreSQL
            const query = `
        WITH existing AS (
            SELECT id FROM zipcodes 
            WHERE zipcode = $1 
            LIMIT 1
        )
        INSERT INTO zipcodes (zipcode, state_fips, geoid, class_fp, mtfcc, func_stat, land_area, water_area, centroid, boundary)
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, ST_SetSRID(ST_MakePoint($9, $10), 4326), ST_GeomFromGeoJSON($11)
        WHERE NOT EXISTS (SELECT 1 FROM existing)
        ON CONFLICT (zipcode) DO UPDATE 
        SET state_fips = $2, geoid = $3, class_fp = $4, mtfcc = $5, func_stat = $6, 
            land_area = $7, water_area = $8, centroid = ST_SetSRID(ST_MakePoint($9, $10), 4326),
            boundary = ST_GeomFromGeoJSON($11);
      `;

            await client.query(query, [
                zipcode, stateFips, geoid, classFp, mtfcc, funcStat,
                landArea, waterArea, centroidLon, centroidLat, geojsonGeometry
            ]);

            console.log(`✅ Inserted ZIP Code: ${zipcode}`);
        }

        console.log("🎉 ZIP Code import completed successfully!");
    } catch (err) {
        console.error("❌ Error importing ZIP codes:", err);
    }
}

// Run the Import Script
importLocations()