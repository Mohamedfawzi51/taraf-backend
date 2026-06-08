import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { AppError, ErrorCodes } from "../utils/errors";

export const getCloudinary = (): typeof cloudinary => {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      500,
      ErrorCodes.INTERNAL_ERROR,
      "Cloudinary is not configured"
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return cloudinary;
};
