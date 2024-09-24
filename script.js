let modifiedImageDataUrl = "";
let originalFileName = "";

document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    // Supprimer la table et les deux boutons post process au changement de photo
    document.getElementById("downloadButton").style.display = "none";
     document.getElementById("removeExifButton").style.display = "none";
     
     document.getElementById("riskIndicator").style.display = "none";
     document.getElementById("metadataTable").style.display = "none";
     document.getElementById("errorEXIF").style.display = "none";

    const file = event.target.files[0];
    if (file) {
      originalFileName = file.name; // Stocker le nom du fichier original
      const imgElement = document.getElementById("imagePreview");

      // Charger l'image et attendre qu'elle soit complètement affichée
      imgElement.src = URL.createObjectURL(file);
      imgElement.style.display = "block";

      // Assurer l'affichage de l'image avant de traiter les métadonnées
      imgElement.onload = function () {
        exifr
          .parse(file)
           .then((metadata) => {
              console.table(metadata);
            const metadataBody = document.getElementById("metadataBody");
             metadataBody.innerHTML = ""; // Vider le tableau avant de remplir
             
// Vérifiez si des métadonnées sont présentes
if (Object.keys(metadata).length === 0) {
   // Aucune métadonnée trouvée
   document.getElementById("errorExif").style.display = "block";
   return; // Sortir de la fonction
 }


            let riskLevel = "low-risk"; // Valeur par défaut

            for (const key in metadata) {
              if (metadata.hasOwnProperty(key)) {
                const row = document.createElement("tr");
                const keyCell = document.createElement("td");
                const valueCell = document.createElement("td");
                keyCell.textContent = key;
                valueCell.textContent = metadata[key];
                row.appendChild(keyCell);
                row.appendChild(valueCell);
                metadataBody.appendChild(row);

                // Vérification des données sensibles
                if (key === "GPSLatitude" || key === "GPSLongitude") {
                  riskLevel = "high-risk"; // Risque élevé si des données GPS sont présentes
                } else if (key.includes("User") || key.includes("Name")) {
                  riskLevel = "medium-risk"; // Risque moyen si des données utilisateur sont présentes
                }
              }
            }

            document.getElementById("metadataTable").style.display = "table";

            // Mettre à jour l'indicateur de risque
            const riskIndicator = document.getElementById("riskIndicator");
            riskIndicator.className = `risk-indicator ${riskLevel}`;
            riskIndicator.textContent =
              riskLevel === "low-risk"
                ? "Aucune donnée sensible détectée."
                : riskLevel === "medium-risk"
                ? "Attention : données utilisateur détectées."
                : "Avertissement : données GPS détectées.";
            riskIndicator.style.display = "block";

            // Afficher le bouton pour supprimer les EXIF
            document.getElementById("removeExifButton").style.display = "block";
          })
          .catch(() => {
            //Erreur de metadonnees ou aucune métadonnées
             document.getElementById("errorEXIF").style.display = "block";
          });
      };
    }
  });

document
  .getElementById("removeExifButton")
  .addEventListener("click", function () {
    const imgElement = document.getElementById("imagePreview");

    // Créer un canvas pour dessiner l'image sans EXIF
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imgElement.src;

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      // Mettre à jour l'image avec la version sans EXIF
      modifiedImageDataUrl = canvas.toDataURL();
      imgElement.src = modifiedImageDataUrl;

      // Afficher le bouton pour télécharger l'image
      document.getElementById("downloadButton").style.display = "block";
    };
  });

document
  .getElementById("downloadButton")
  .addEventListener("click", function () {
    const link = document.createElement("a");
    link.href = modifiedImageDataUrl;
    link.download = "sans_exif_" + originalFileName; // Utiliser le nom de fichier original
    link.click();
  });
