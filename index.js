const express = require("express"); //npm i express
const mongoose = require("mongoose"); //npm i mongoose
const cors = require("cors");  //npm i cors
const morgan = require("morgan"); //npm i morgan affiche des logs de connexion
const fileUpload = require("express-fileupload"); //npm i express-fileupload  Import de fileupload qui nous permet de recevoir des formdata
const cloudinary = require("cloudinary").v2; //npm i cloudinary
//npm i axios
require('dotenv').config(); //npm i dotenv
const app = express();//* création du serveur
app.use(express.json());//* récupérer les paramètres de type Body
app.use(morgan("dev"));
app.use(cors()); //* le module cors permet d'autoriser ou non les demandes provenant de l'extérieur.

const convertToBase64 = require("./convertToBase64");

//! Données à remplacer avec les vôtres :
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

//* se connecter à la BDD
// const connectDatabase = async () => {
//     try {
//         mongoose.set("strictQuery", false);
//         await mongoose.connect(process.env.MONGODB_URI); // Pour se connecter à la BDD, sans préciser les identifiants
//         console.log("connected to database 🗃️ ");
//     } catch (error) {
//         console.log(error);
//         process.exit(1);
//     }
// };
// connectDatabase();

app.get("/", (req, res) => {
    res.json("👩‍💻 Bienvenue sur UPLOAD FILES 👾");
});


// http://127.0.0.1:3200/upload
app.post(
    "/upload",
    fileUpload(),
    async (req, res) => {
        try {
            console.log("je suis dans ma route upload");
            // Les fichiers reçus sont dans req.files : renvoie un objet ou un tableau si plusieurs images
            // pictures est un tableau d'objets de fichiers, car cette clé contient deux images. 
            // Si une seule image, pictures aurait été un objet de fichiers et non un tableau d'objets
            console.log("req.files : ", req.files); // afficher les fichiers reçus

            if (!Array.isArray(req.files.pictures)) {
                // cloudinary.uploader.upload(file, options). then(callback)
                const result = await cloudinary.uploader.upload(  // Envoi de l'image à cloudinary
                    convertToBase64(req.files.pictures), // file
                    {
                        folder: `Vinted/VintedOffers/ImagesOffers/`,// options
                         public_id: `img_test`
                    }
                );
                res.send(result.secure_url);
            } else {

                const arrayOfFilesUrl = [];
                const picturesToUpload = req.files.pictures;

                for (let i = 0; i < req.files.pictures.length; i++) {
                    const pictures = picturesToUpload[i];

                    // cloudinary.uploader.upload(file, options). then(callback)
                    const result = await cloudinary.uploader.upload(  // Envoi de l'image à cloudinary
                        convertToBase64(pictures), // file
                        {
                            folder: `Vinted/VintedOffers/ImagesOffers/`,// options
                            // public_id: `img_test`,
                        }
                    );
                    arrayOfFilesUrl.push(result.secure_url);
                }

                // res.json(arrayOfFilesUrl);
                res.send(arrayOfFilesUrl);
            }

            // res.send("OK");
        } catch (error) {
            console.log("catch error: ", error);
            console.log("catch error.response: ", error.response);
            res.status(400).json({ message: error.message });
        }
    }
);

//! ***************************************************
// app.delete(
//     "/delete",
//     async (req, res) => {
//         try {
//             console.log("je suis dans ma route delete");

//             // cloudinary.v2.api.delete_resources(public_ids, options).then(callback);
//             const result = await cloudinary.delete_resources(  // suppression des images dans Cloudinary
//                 convertToBase64(req.files.pictures), // file
//                 {
//                     folder: `Vinted/VintedOffers/ImagesOffers/`,// options
//                     public_id: `${_id}`,
//                 }
//             );
//             arrayOfFilesUrl.push(result.secure_url);

//             res.send("ok");

//         } catch (error) {
//             console.log("catch error: ", error);
//             console.log("catch error.response: ", error.response);
//             res.status(400).json({ message: error.message });
//         }
//     }
// );

app.all("*", (req, res) => {
    res.status(404).json({ message: "⚠️ This route doesn't exist !!! ⚠️" });
});


app.listen(process.env.PORT || 3200, () => {
    console.log(" 🚀 Server started !!! 🚀");
});
