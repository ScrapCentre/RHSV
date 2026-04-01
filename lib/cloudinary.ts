import { v2 as cloudinary } from 'cloudinary';

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (
    fileBuffer: Buffer,
    folder: string,
    filename: string,
    resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto',
    options?: any
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: filename,
                resource_type: resourceType,
                ...options
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error("Unknown error uploading to Cloudinary"));
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export default cloudinary;
