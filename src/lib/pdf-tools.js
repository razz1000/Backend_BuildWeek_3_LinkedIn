import PdfPrinter from "pdfmake";
import axios from "axios";

const fonts = {
  Roboto: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
  },
};

const printer = new PdfPrinter(fonts);

export const getPDFReadableStream = async (profile) => {
  let imagePath = {};
  if (profile.image) {
    const response = await axios.get(profile.image, {
      responseType: "arraybuffer",
    });
    const profileImageURLPaths = profile.image.split("/");
    const fileName = profileImageURLPaths[profileImageURLPaths.length - 1];
    const [id, extension] = fileName.split(".");
    const base64 = response.data.toString("base64");
    const base64Image = `data:image/${extension};base64,${base64}`;
    imagePath = { image: base64Image, width: 500, margin: [0, 0, 0, 40] };
  }
  const profileDefinition = {
    content: [
      {
        image: imagePath,
        width: 150,
      },
      {
        text: [profile.name + " " + profile.surname],
        style: "header",
        margin: [0, 10, 0, 0],
      },

      {
        text: profile.title,
        style: "subheader",
        margin: [0, 10, 0, 10],
      },

      {
        text: profile.email,
        style: "quote",
        margin: [0, 10, 0, 0],
      },
      {
        text: profile.area,
        style: "quote",
        margin: [0, 10, 0, 10],
      },
      {
        text: profile.bio,
        style: "quote",
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
      },
      subheader: {
        fontSize: 15,
        bold: true,
      },
      small: {
        fontSize: 8,
      },
    },
    defaultStyle: {
      font: "Helvetica",
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(profileDefinition, {});

  pdfReadableStream.end();

  return pdfReadableStream;
};
