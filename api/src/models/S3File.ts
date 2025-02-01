import { Model, DataTypes } from "sequelize";
import { sequelize } from "../database";

export class S3File extends Model {
    public id!: string;
    public file_name!: string;
    private s3_url!: string;
    private s3_key!: string;
    public bucket_name!: string;
    public mime_type!: string;
    public width?: number;
    public height?: number;
    public duration?: number;
    public parent?: string;
    public file_size!: number;
    public readonly created!: Date;

    get url(): string {
      return this.s3_url
    }

    get key(): string {
      return this.s3_key
    }
  }

S3File.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    file_name: { type: DataTypes.STRING, allowNull: false },
    s3_url: { type: DataTypes.STRING, allowNull: false },
    s3_key: { type: DataTypes.STRING, allowNull: false, unique: true },
    bucket_name: { type: DataTypes.STRING, allowNull: false },
    mime_type: { type: DataTypes.STRING, allowNull: false },
    file_size: { type: DataTypes.BIGINT, allowNull: false },
    width: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
    parent: DataTypes.UUID,
    created: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: "s3_file", timestamps: false }
);