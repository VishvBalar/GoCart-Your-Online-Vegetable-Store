import multer from "multer";


// Configure multer for file uploads
export const upload = multer({storage: multer.diskStorage({})});