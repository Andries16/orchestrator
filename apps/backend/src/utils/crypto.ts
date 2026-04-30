import crypto from "crypto";
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is missing.");
  }
  return Buffer.from(key, "hex");
}
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}
export function decrypt(text: string): string {
  try {
    const textParts = text.split(":");
    if (textParts.length !== 2) return text;
    const ivPart = textParts.shift();
    if (!ivPart) return text;
    const iv = Buffer.from(ivPart, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (e) {
    console.warn("Failed to decrypt string, returning original.");
    return text;
  }
}
