import { Union, Literal, Static, Record, String } from "runtypes";
import { validTypeOrError } from "../types";

const Language = Union(Literal("cpp"), Literal("cs"), Literal("c"), Literal("java"), Literal("py"));
type Language = Static<typeof Language>;

export const CompilerMultiTestsRequest = Record({
    code: String,
    language: Language,
    input: String,
});

export type CompilerMultiTestsRequest = Static<typeof CompilerMultiTestsRequest>;

export const sanitizeRequest = (c: CompilerMultiTestsRequest) => {
    return {
        code: c.code,
        language: c.language,
        input: c.input,
    } as CompilerMultiTestsRequest;
};

export const validateRequest = (req: unknown): validTypeOrError<CompilerMultiTestsRequest> => {
    try {
        return [true, sanitizeRequest(CompilerMultiTestsRequest.check(req))];
    } catch (error) {
        return [false, error];
    }
};
