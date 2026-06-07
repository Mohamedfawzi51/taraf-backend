import { v2 as cloudinary } from "cloudinary";
import { AppError, ErrorCodes } from "../utils/errors";

const getCloudinaryEnv = () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  apiKey: process.env.CLOUDINARY_API_KEY?.trim(),
  apiSecret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

export const getCloudinary = (): typeof cloudinary => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(
      500,
      ErrorCodes.INTERNAL_ERROR,
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return cloudinary;
};
