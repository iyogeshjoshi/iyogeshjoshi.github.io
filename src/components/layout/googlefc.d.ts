/** AdSense Privacy & messaging (Funding Choices) revocation API. */
interface GoogleFundingChoices {
  callbackQueue?: Array<() => void>;
  showRevocationMessage?: () => void;
}

declare global {
  interface Window {
    googlefc?: GoogleFundingChoices;
  }
}

export {};
