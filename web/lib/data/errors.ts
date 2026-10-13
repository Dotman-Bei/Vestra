/** The chain (or indexer) couldn't be reached. Says nothing about the record itself. */
export class ChainReadError extends Error {
  constructor(message = "Couldn’t reach BOT Chain") {
    super(message);
    this.name = "ChainReadError";
  }
}

/**
 * - available: the linked metadata loaded (and matched its recorded hash, when there is one)
 * - mismatch: it loaded but doesn't match the recorded hash
 * - unavailable: it couldn't be loaded
 * - none: no metadata is linked
 */
export type MetadataStatus = "available" | "mismatch" | "unavailable" | "none";
