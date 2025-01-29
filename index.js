import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectToDB } from "./connecToDB.js";
import routes from "./route.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

connectToDB();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
