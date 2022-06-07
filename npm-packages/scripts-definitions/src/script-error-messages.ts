interface IVerificationResultDetails {
  name: string;
  description: string;
}

/**
 * List containing all possible verification error messages.
 * For reference, check the backend's README.
 */
export const possibleVerificationErrors: { [code: string]: IVerificationResultDetails } = {
  "[SIGNATURE][FINAL]": {
    name: "Signature does not match",
    description: "The signature does not match with the script content.",
  },
  "[REVOKED][FINAL]": {
    name: "Script has been revoked",
    description:
      "The script owner revoked the script and cannot be executed anymore.",
  },
  "[REPETITIONS_CONDITION][FINAL]": {
    name: "Max repetitions reached",
    description:
      "The script has reached the max number of repetitions and cannot be executed anymore.",
  },
  "[ZERO_AMOUNT][FINAL]": {
    name: "Both token amounts are 0",
    description:
      "The script has both amounts set to 0, even though either of them should be set.",
  },
  "[UNSUPPORTED_PAIR][FINAL]": {
    name: "LP not supported by the router",
    description:
      "The script has a pair of tokens for which a pair (LP) cannot be found.",
  },
  "[FOLLOW_CONDITION][TMP]": {
    name: "Waiting for other script",
    description:
      "This script is bound to another script that hasn't been executed yet.",
  },
  "[FREQUENCY_CONDITION][TMP]": {
    name: "Cool-down in place",
    description: "Not enough time has passed for this script to be executed.",
  },
  "[BALANCE_CONDITION_LOW][TMP]": {
    name: "Balance too low",
    description:
      "The user has not enough tokens in the wallet and the balance condition cannot be triggered.",
  },
  "[BALANCE_CONDITION_HIGH][TMP]": {
    name: "Balance too high",
    description:
      "The user has too many tokens in the wallet and the balance condition cannot be triggered.",
  },
  "[PRICE_CONDITION_LOW][TMP]": {
    name: "Price too low",
    description: "The token price is below the one set in the price condition.",
  },
  "[PRICE_CONDITION_HIGH][TMP]": {
    name: "Price too high",
    description: "The token price is above the one set in the price condition.",
  },
  "[SCRIPT_BALANCE][TMP]": {
    name: "Script balance low",
    description:
      "The minimum balance needed for the script to run is not reached.",
  },
  "[GAS][TMP]": {
    name: "Gas tank too empty",
    description:
      "The user doesn't have enough gas in the gas tank to execute the scripts.",
  },
  "[TIP][TMP]": {
    name: "Cannot pay tip",
    description:
      "The user set a tip, but doesn't have enough funds to pay for it.",
  },
  "[HEALTH_FACTOR_LOW][TMP]": {
    name: "Health factor low",
    description: "Health Factor lower than threshold",
  },
  "[HEALTH_FACTOR_HIGH][TMP]": {
    name: "Health factor high",
    description: "Health Factor higher than threshold",
  },
  "[ALLOWANCE][ACTION]": {
    name: "Missing allowance",
    description:
      "The user needs to give allowance to the executor contract to move some tokens",
  },
  "[TIP_ALLOWANCE][ACTION]": {
    name: "Missing tip allowance",
    description:
      "The user needs to give allowance to the executor contract to move their DAEM for the tips",
  },
  "[CHAIN][ERROR]": {
    name: "Wrong chain",
    description: "The script is trying to be executed in the wrong chain.",
  },
  "[BORROW_TOO_HIGH][FINAL]": {
    name: "Trying to borrow a dangerous amount",
    description:
      "The script is set to borrowing a percentage that is too high and would put the user at risk.",
  },
  "[BORROW_TOO_HIGH][TMP]": {
    name: "Not enough borrowing power",
    description:
      "The script is trying to borrow an amount that would put the user at risk now, but would be alright in another moment.",
  },
  "[NO_DEBT][TMP]": {
    name: "No debt to repay",
    description:
      "The script is to repay a debt that does not exist (yet/anymore)",
  },
  "[DRY_RUN_FAILED][TMP]": {
    name: "Dry run failed",
    description:
      "The script passes all checks, but it fails during the dry run. It could be due to an error in the smart contract",
  },
};
