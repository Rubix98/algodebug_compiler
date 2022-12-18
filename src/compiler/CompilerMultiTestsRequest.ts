import { Union, Literal, Static, Record, String } from "runtypes";

const Language = Union(Literal("cpp"), Literal("cs"), Literal("c"), Literal("java"), Literal("py"));
type Language = Static<typeof Language>;

export const CompilerMultiTestsRequest  = Record({
    code: String,
    language: Language,
    input: String,
});

export type CompilerMultiTestsRequest = Static<typeof CompilerMultiTestsRequest >;

export const sanitizeRequest = (c: CompilerMultiTestsRequest ) => {
    return {
        code: c.code,
        language: c.language,
        input: c.input,
    } as CompilerMultiTestsRequest;
};

type validCodeOrError = [true, CompilerMultiTestsRequest ] | [false, unknown];

export const validateRequest = (req: unknown): validCodeOrError => {
    try {
        return [true, sanitizeRequest(CompilerMultiTestsRequest.check(req))];
    } catch (error) {
        return [false, error];
    }
};