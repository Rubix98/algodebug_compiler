import { Request, Response } from "express";
import { validateRequest  } from "./CompilerMultiTestsRequest";
import { compileAndExecute } from "./compilerService";

export const compileCode = async (req: Request, res: Response) => {
    const [isOk, data] = validateRequest(req.body);

    if (!isOk) {
        res.status(400).json({ error: "Invalid request body: " + data });
        return;
    }

    try {
        let response = await compileAndExecute(req.body);
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};


