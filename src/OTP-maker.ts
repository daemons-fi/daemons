import { createHash } from "crypto";

export const OTP_SLOT_SECONDS = 10;

/**
 * This function should compute a predictable
 * OTP that can be used to verify the user
 * @param user The user address to verify.
 * @param previous a flag indicating whether the previous OTP should be returned.
 * This is useful to prevent errors in OTPs inputted between one time slot and the other.
 */
export function makeOTP(user: string, previous: boolean = false): string {
    let timeSlot = getTimeSlot();
    if (previous) timeSlot--;

    const toBeHashed = `${user}${timeSlot}${process.env.OTP_KEY}`;
    const hashed = createHash("sha512").update(toBeHashed).digest('hex');
    return hashed.slice(0, 8).toUpperCase();
}

/**
 * Returns a number representing the current time-slot
 */
const getTimeSlot = (): number => Math.trunc(Date.now()/1000/OTP_SLOT_SECONDS);
