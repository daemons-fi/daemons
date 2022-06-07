import { ethers } from "ethers";

/**
 * Parsing the validation error is trickier than it seems as
 * there isn't a unique standard to return the text and it depends
 * by which provider the user is using.
 *
 * This function tries to find a unique way to do it.
 *
 * @param error the error raised by the Validate or Execute functions
 * @returns a string containing the parsed error
 */
export function parseValidationError(error: any): string {
    try {
        // sometimes the reason is just in clear, we can exploit that
        if (
            error.reason &&
            (error.reason as string).startsWith("[") &&
            (error.reason as string).endsWith("]")
        ) {
            return error.reason;
        }
    } catch (error) {}

    try {
        // this will likely work on kovan with the default Metamask Provider
        if (error.data) return parseErrorDataText(error.data);
    } catch (error) {}

    try {
        // this will likely work on kovan with the default Metamask Provider
        const rinkebyError: string = error.error.data.originalError.message;
        if (rinkebyError) {
            const split = rinkebyError.split(" ");
            return split[split.length - 1];
        }
    } catch (error) {}

    try {
        // this will likely work on Fantom testnet with the default Metamask Provider
        if (error.data.data) return parseErrorDataText("Reversed " + error.data.data);
    } catch (error) {}

    try {
        // this should work with Infura Kovan
        let toBeParsed = "";

        if (error.response && isString(error.response)) toBeParsed = error.response;
        if (!toBeParsed && error.error.response && isString(error.error.response))
            toBeParsed = error.error.response;

        if (!toBeParsed) throw new Error("Wrong parsing strategy");

        const parsedResponse = JSON.parse(toBeParsed);
        return parseErrorDataText(parsedResponse.error.data);
    } catch (error) {}

    try {
        // this should work with Infura Rinkeby
        if (
            error.error.response &&
            (typeof error.error.response === "string" || error.error.response instanceof String)
        ) {
            const parsedResponse = JSON.parse(error.error.response);
            if (parsedResponse.error.message) {
                const split = (parsedResponse.error.message as string).split(" ");
                return split[split.length - 1];
            }
        }
    } catch (error) {}

    // we can extract the verification failure reason
    console.error("-----------");
    console.error(
        "Could not parse RPC validation error. Please send this to Daemons so we can add your provider"
    );
    console.error("");
    console.error(JSON.stringify(error));
    console.error("");
    console.error("Include the chain you are on and the RPC url/provider you are using");
    console.error("-----------");

    return "Unknown";
}

function parseErrorDataText(errorText: string): string {
    const hex = "0x" + errorText.substring(147);
    const withoutTrailing0s = hex.replace(/0*$/g, "");
    const result = ethers.utils.toUtf8String(withoutTrailing0s);

    if (!isValidErrorData(result)) throw new Error(`Invalid parsed error data "${result}"`);
    return result;
}

const isValidErrorData = (parsedError: string): boolean => parsedError.length > 0;
const isString = (thing: any): boolean => typeof thing === "string" || thing instanceof String;
