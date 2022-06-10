import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import {
  badRequestHandler,
  genericErrorHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import profileRouter from "./apis/profile/index.js";
import postRouter from "./apis/posts/index.js";
import experiencesRouter from "./apis/experiences/index.js";
import commentRouter from "./apis/comment/index.js";

const server = express();
const port = process.env.PORTS || 3005;

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

const corsOptions = {
  origin: (origin, next) => {
    console.log("CURRENT ORIGIN: ", origin);

    if (!origin || whitelist.indexOf(origin) !== -1) {
      next(null, true);
    } else {
      next(
        createError(
          400,
          `Cors Error! your origin ${origin} is not in the list!`
        )
      );
    }
  },
};

// ** MIDDLEWARES ****---------------------------

server.use(cors());
server.use(express.json());

//** ENDPOINTS **

/* server.use("/userInfo", userInfoRouter); */
server.use("/profile", profileRouter);

server.use("/posts", postRouter);

server.use("/experience", experiencesRouter);

server.use("/comment", commentRouter);

// * ERROR HANDLERS **---------------------------

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_CONNECTION_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
