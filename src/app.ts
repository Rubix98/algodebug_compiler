import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { compileCode } from "./compiler/compilerEnpoints";

interface ResponseError extends Error {
    status?: number;
}

// test env variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

["PORT"].forEach((variable) => {
    if (!process.env[variable]) {
        throw new Error(`Environment variable ${variable} is not set`);
    }
});

// initialize express app
const app = express();

/* Middleware */

app.listen(process.env.PORT, () => {
    console.log(`Compiler is running on port: ${process.env.PORT}`);
});

// attach application/json header to all responses
app.use((_req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
});

// allow cross-origin requests for all origins defined in .env
app.use(cors({ origin: (process.env.ORIGINS as string).split(",") }));

// parse request body as JSON
app.use(express.json());

// catch invalid JSONs
app.use((err: ResponseError, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).send({ error: err.message });
    }
    next();
});

/* API endpoints */

app.post("/compile", compileCode);
