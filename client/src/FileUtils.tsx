import * as ExifReader from 'exifreader';
import { LatLng } from 'leaflet';
import { GeoSearchResponse } from './GeoSearchResponse';
import { Complaint, ComplaintType } from './Complaints';

export const getFileHash = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      crypto.subtle
        .digest('SHA-256', reader.result as ArrayBuffer)
        .then((hashBuffer) =>
          resolve(
            Array.from(new Uint8Array(hashBuffer))
              .map((byte) => byte.toString(16).padStart(2, '0'))
              .join('')
          )
        )
        .catch(reject);
    reader.readAsArrayBuffer(file);
  });

export const resizeImageWebCodecs = async (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    if (!("ImageDecoder" in window)) throw new Error("WebCodecs API not supported");
  
    const bitmap = await createImageBitmap(file);
    let width = bitmap.width;
    let height = bitmap.height;
  
    // Calculate new dimensions
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  
    // Resize using OffscreenCanvas (GPU acceleration)
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
  
    if (!ctx) throw new Error("Canvas context not supported");
  
    ctx.drawImage(bitmap, 0, 0, width, height);
  
    return canvas.convertToBlob({ type: file.type });
  };

  export const resizeImageCanvasHQ = async (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    const img = await createImageBitmap(file);
  
    let width = img.width;
    let height = img.height;
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    if (!ctx) throw new Error("Canvas context not supported");
  
    canvas.width = width;
    canvas.height = height;
  
    // Set high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  
    ctx.drawImage(img, 0, 0, width, height);
  
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to resize image"));
        },
        file.type,
        1 // Adjust quality (0.9 = high)
      );
    });
  };

export interface UsableExif {
    file: File,
    url: string,
    location?: LatLng,
    time?: Date,
    hash: string,
    geo?:GeoSearchResponse,
    width: number,
    height: number
}

export const fetchAddress = async (lat: number, lng: number, complaint?: Complaint) => {

  try {
    // Check if the address is already cached
    const cachedData = localStorage.getItem(`geocode_${lat}_${lng}`);
    if (cachedData) {
      console.log("Address retrieved from cache");
      return JSON.parse(cachedData) as GeoSearchResponse;
    }

    const query = new URLSearchParams({
      gatekeeperKey: '6ba4de64d6ca99aa4db3b9194e37adbf',
    })

    const url = `https://api.phila.gov/ais_doc/v1/reverse_geocode/${lng},${lat}?${query.toString()}`;
    // If not cached, call the Google Maps Geocoding API
    const response = await fetch(
      url
    );
    const data:GeoSearchResponse = await response.json();

    if (data.features.length > 0) {
      // Cache the result in localStorage
      localStorage.setItem(`geocode_${lat}_${lng}`, JSON.stringify(data));

      // Update the state
      return data
    } else {
      console.error("No address found for the given coordinates.");
      throw Error("no way")
    }
  } catch (error) {
    console.error("Error fetching the address:", error);
    throw error
  }
};

const getImageSizeFromFile = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file); // Create temporary URL
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src); // Free memory
    };
    img.onerror = reject;
  });
};


export const exifGetter = async (file: File): Promise<UsableExif> => {
      if(file.type.indexOf('image/')==-1) {
        throw Error("images only for now")
      }
      const hash = await getFileHash(file)
      
      const tags = await ExifReader.load(file);
      
      const unprocessedTagValue = tags['DateTimeOriginal']?.value;
      const offsetTime = tags['OffsetTime']?.value
      let ex = {} as UsableExif
      ex.file = file
      ex.url = URL.createObjectURL(file)
      ex.hash = hash
      if (offsetTime && unprocessedTagValue) {
        const dateWithZone = `${unprocessedTagValue}${offsetTime}`.replace(/^(\d{4}):(\d{2}):/, '$1-$2-').replace(' ', 'T');
        const dateTime = new Date(dateWithZone)
        ex.time = dateTime
      } else if (unprocessedTagValue) {

      }
      const size = await getImageSizeFromFile(file)
      ex.width = size.width
      ex.height = size.height
      const latitude =
        tags['GPSLatitudeRef']?.description?.toLowerCase() === 'south latitude'
          ? -Math.abs(parseFloat(tags['GPSLatitude']?.description || '0'))
          : parseFloat(tags['GPSLatitude']?.description || '0');

      const longitude =
        tags['GPSLongitudeRef']?.description?.toLowerCase() === 'west longitude'
          ? -Math.abs(parseFloat(tags['GPSLongitude']?.description || '0'))
          : parseFloat(tags['GPSLongitude']?.description || '0');

      if(latitude && longitude) {
        ex.location = new LatLng(latitude, longitude)
        const geo = await fetchAddress(latitude, longitude)
        if(geo) {
          ex.geo = geo
        }
      }
      return ex
    }