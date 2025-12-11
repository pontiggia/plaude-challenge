import crypto from "crypto";

export function verifySlackRequest(signingSecret: string, signature: string, timestamp: string, body: string): boolean {
    // Check for missing inputs
    if (!signingSecret || !signature || !timestamp || !body) {
        return false;
    }

    // Check timestamp to prevent replay attacks (5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
        return false;
    }

    const sigBasestring = `v0:${timestamp}:${body}`;
    const mySignature = "v0=" + crypto.createHmac("sha256", signingSecret).update(sigBasestring).digest("hex");

    // timingSafeEqual requires equal length buffers
    const mySignatureBuffer = Buffer.from(mySignature);
    const signatureBuffer = Buffer.from(signature);

    if (mySignatureBuffer.length !== signatureBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(mySignatureBuffer, signatureBuffer);
}
