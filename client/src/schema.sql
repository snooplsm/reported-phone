-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for storing locations (Supports POINT, POLYGON, MULTIPOLYGON)
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    geometry GEOMETRY NOT NULL CHECK (
        ST_GeometryType(geometry) IN ('ST_Point', 'ST_Polygon', 'ST_MultiPolygon')
    ), -- Allows POINT, POLYGON, and MULTIPOLYGON
    street TEXT,
    building_number TEXT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    created TIMESTAMP DEFAULT NOW(),
    UNIQUE (geometry, building_number, city, state, zip)
);

-- Table for storing reports related to locations
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    complaint TEXT NOT NULL CHECK (complaint IN ('blocked bike lane', 'blocked crosswalk', 'missing crosswalk')),
    time TIMESTAMP NOT NULL,
    created TIMESTAMP DEFAULT NOW(),
    location_id INT NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    UNIQUE (complaint, time, location_id)
);

-- Table for storing S3 file metadata
CREATE TABLE s3_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type TEXT NOT NULL,
    s3_url TEXT NOT NULL,  -- Full S3 URL (e.g., https://s3.amazonaws.com/bucket-name/path/to/file.jpg)
    bucket_name TEXT NOT NULL,  -- S3 Bucket Name
    s3_key TEXT NOT NULL UNIQUE,  -- S3 Object Key (e.g., path/to/file.jpg)
    width INT CHECK (width > 0),  -- Image width (nullable for non-image files)
    height INT CHECK (height > 0), -- Image height (nullable for non-image files)
    duration INT CHECK (duration > 0), -- Duration in seconds (nullable for non-video files)
    parent UUID NULL,  -- Self-referencing parent file
    created TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (parent) REFERENCES s3_files(id) ON DELETE SET NULL
);

-- Table linking reports and S3 files
CREATE TABLE report_files (
    id SERIAL PRIMARY KEY,
    report_id INT NOT NULL,
    file_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'document', 'audio', 'other')),
    created TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES s3_files(id) ON DELETE CASCADE,
    UNIQUE (report_id, file_id)
);

-- Table for tracking report statuses
CREATE TABLE report_status (
    id SERIAL PRIMARY KEY,
    report_id INT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('0:pending', '1:submitted', 'e1:error')),
    data TEXT, -- Stores additional information about the status
    attempt INT DEFAULT 0, -- Number of retry attempts
    start TIMESTAMP NOT NULL, -- When the status process started
    finish TIMESTAMP NULL, -- When the process finished (optional)
    created TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    UNIQUE (report_id, status, attempt) -- Ensures unique status attempts per report
);