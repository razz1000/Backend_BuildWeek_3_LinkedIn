import PdfPrinter from "pdfmake";
import axios from "axios";

export const getPdfReadableStream = async (profile) => {
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
    },
  };

  const response = await axios.get(profile.image, {
    responseType: "arraybuffer",
  });

  const profileImageURLParts = profile.image.split("/");
  const fileName = profileImageURLParts[profileImageURLParts.length - 1];
  const [id, extension] = fileName.split(".");
  const toBase64 = response.data.toString("base64");
  const base64Image = `data:image/${extension};base64,${toBase64}`;

  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      {
        image: base64Image,
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

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {});
  pdfReadableStream.end();

  return pdfReadableStream;
};
