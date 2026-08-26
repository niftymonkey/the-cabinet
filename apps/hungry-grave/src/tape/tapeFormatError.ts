// What a decoder throws when bytes are not a tape, rather than guessing.

/**
 * Named rather than a bare Error, because a screen handed arbitrary bytes has
 * to tell a document it should refuse from a bug of ours it must not swallow.
 */
class TapeFormatError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'TapeFormatError';
  }
}

export { TapeFormatError };
