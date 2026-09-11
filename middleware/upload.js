import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "ac-mobility",
        allowedFormats: ["jpg", "jpeg", "png"]
    }
})
const upload = multer({storage, limits: {fileSize: 1024 * 1024 * 5}}) // Limit file size to 5MB
export default upload;