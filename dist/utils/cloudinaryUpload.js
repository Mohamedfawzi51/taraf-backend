"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadManyToCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadToCloudinary = async (file, folder = "products") => {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    const result = await cloudinary_1.default.uploader.upload(dataUri, {
        folder,
        resource_type: "image",
    });
    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
};
exports.uploadToCloudinary = uploadToCloudinary;
const uploadManyToCloudinary = async (files, folder = "products") => {
    return Promise.all(files.map((file) => (0, exports.uploadToCloudinary)(file, folder)));
};
exports.uploadManyToCloudinary = uploadManyToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    await cloudinary_1.default.uploader.destroy(publicId);
};
exports.deleteFromCloudinary = deleteFromCloudinary;
