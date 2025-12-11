import crypto from "crypto";

export function verifySlackRequest(signingSecret: string, signature: string, timestamp: string, body: string): boolean {
    // Check timestamp to prevent replay attacks (5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
        return false;
    }

    const sigBasestring = `v0:${timestamp}:${body}`;
    const mySignature = "v0=" + crypto.createHmac("sha256", signingSecret).update(sigBasestring).digest("hex");

    return crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(signature));
}
