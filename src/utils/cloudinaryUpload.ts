import { getCloudinary } from "../config/cloudinary";
import { AppError, ErrorCodes } from "./errors";

export interface UploadedImage {
  url: string;
  publicId: string;
}

const toUploadError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : "Unknown upload error";

  return new AppError(502, ErrorCodes.INTERNAL_ERROR, `Image upload failed: ${message}`);
};

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder = "products"
): Promise<UploadedImage> => {
  if (!file.buffer?.length) {
    throw new AppError(400, ErrorCodes.BAD_REQUEST, "Uploaded file is empty");
  }

  try {
    const cloudinary = getCloudinary();
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw toUploadError(error);
  }
};

export const uploadManyToCloudinary = async (
  files: Express.Multer.File[],
  folder = "products"
): Promise<UploadedImage[]> => {
  return Promise.all(files.map((file) => uploadToCloudinary(file, folder)));
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw toUploadError(error);
  }
};

export const deleteManyFromCloudinary = async (
  publicIds: string[]
): Promise<void> => {
  await Promise.allSettled(publicIds.map((publicId) => deleteFromCloudinary(publicId)));
};
