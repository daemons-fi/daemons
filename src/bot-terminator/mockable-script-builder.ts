import { parseScript as OG } from "@daemons-fi/scripts-definitions/build";

// using this module only because we need to mock this function in the tests
// and it's much easier if it is local.

export const parseScript = OG;
