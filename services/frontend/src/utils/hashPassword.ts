import "fast-text-encoding";
import crypto from "isomorphic-webcrypto";

const encoder = new TextEncoder();

/** Utility function for hashing a password using SHA-512. And now to explain _why_...
 *
 *  Currently, the Backend server uses bcrypt to salt+hash passwords before storing in them the database.
 *  This good, standard, and not changing.
 *
 *  However, the problem lies in the fact that the user's cleartext password is sent to the server for
 *  this salting+hashing step. And it is problematic that the server sees the user's password _at all_
 *  because of the fact that we use this same password for handling client-side encryption. As such,
 *  users might understandably be concerned that we could be saving their passwords and accessing their
 *  data.
 *
 *  As such, the decision has been made to hash the password on the client side before sending it to the
 *  server. This means the password needs to be hashed before doing all of the following auth operations:
 *  login, sign up, password reset, and password change (aka anything that has to do with a password).
 *
 *  By hashing the password client side, we gain several advantages:
 *
 *  1. As mentioned previously, the server no longer ever sees the user's cleartext password, so users
 *     can verify the integrity of our system just by viewing what data is sent through network requests,
 *     and seeing that we never deal with their password.
 *
 *  2. Because, from the server's POV, the hashed password _is_ the user's password, if someone were steal
 *     our database and crack passwords, they at least wouldn't be able to use these hashed passwords
 *     to attack other services (mitigating password reuse from the user's perspective).
 *
 *  3. Since the hashed password is significantly longer than the average user's password, this (probably)
 *     also affords us a good amount of protection against hackers cracking the salted/hashed passwords
 *     that the database stores.
 *
 *  All together, I see next to no downsides to adding client side hashing _on top of_ the existing server
 *  side hashing that is already in place.
 *
 *  The reason to choose SHA-512 over SHA-256 was simple: the output is longer. Does that really matter
 *  when the salted/hashed passwords end up shorter? Probably not, but it (shouldn't) hurt. */
const hashPassword = async (password: string): Promise<string> => {
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-512", data);

    return encodeBufferToBase64(hash);
};

export default hashPassword;

/* Helper Functions */

// Taken from `redux-e2e-encryption`s `StringEncoder` class.
const encodeBufferToBase64 = (rawBuffer: ArrayBuffer): string => {
    // Taken from: https://coolaj86.com/articles/typedarray-buffer-to-base64-in-javascript/
    const typedBuffer = new Uint8Array(rawBuffer);

    // Use `map` like this because calling `typedBuffer.map` always results in a new
    // TypedArray, whereas we want to create an array of strings.
    const rawString = Array.prototype.map
        .call(typedBuffer, (charCode) => String.fromCharCode(charCode))
        .join("");

    return btoa(rawString);
};
