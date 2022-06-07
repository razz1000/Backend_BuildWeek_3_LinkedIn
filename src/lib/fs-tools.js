import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeFile, writeJSON, createReadStream } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

const productJSONPath = join(dataFolderPath, "products.json");
const reviewsJSONPath = join(dataFolderPath, "reviews.json");

const productsPublicFodlerPath = join(process.cwd(), "./public/img/products");
const reviewsPublicFodlerPath = join(process.cwd(), "./public/img/reviews");

export const getProducts = () => {
  return readJSON(productJSONPath);
};
export const getReviews = () => {
  return readJSON(reviewsJSONPath);
};
export const writeProducts = (productsArray) => {
  return writeJSON(productJSONPath, productsArray);
};
export const writeReviews = (ReviewsArray) => {
  return writeJSON(reviewsJSONPath, ReviewsArray);
};
export const saveProductsPicture = (fileName, contentAsBuffer) => {
  const filePath = join(productsPublicFodlerPath, fileName);
  const whereWeSaved = `/img/products/${fileName}`;
  writeFile(filePath, contentAsBuffer);
  const url = `http://localhost:5001${whereWeSaved}`;
  return url;
};

export const getProductsReadableStream = () => {
  return createReadStream(productJSONPath);
};
