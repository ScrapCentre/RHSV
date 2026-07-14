/**
 * lib/validation.ts
 * Central input validation & sanitization library.
 * Uses Zod (already a transitive dep via next-auth).
 * Import schemas/helpers from here — never re-implement inline.
 */

import { z } from "zod";

// ─── Primitive schemas ────────────────────────────────────────────────────────

/** Valid email address, max 254 chars, always lowercased */
export const zEmail = z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .max(254, "Email address is too long");

/** Indian mobile: exactly 10 digits OR +91 followed by 10 digits */
export const zPhone = z
    .string()
    .trim()
    .regex(/^(\+91)?[6-9]\d{9}$/, "Invalid phone number (must be a valid 10-digit Indian mobile)");

/** MongoDB ObjectId — 24-char hex string */
export const zMongoId = z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid ID format");

/** Generic name: 1–100 chars, no angle brackets (prevents tag injection) */
export const zName = z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name is too long (max 100 characters)")
    .refine((v) => !/<|>/.test(v), "Name contains invalid characters");

/** Password: min 6 chars */
export const zPassword = z
    .string()
    .min(6, "Password must be at least 6 characters");

/** Indian PAN number: AAAAA9999A format */
export const zPAN = z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN number format");

/** Indian GST number: 15-character format */
export const zGST = z
    .string()
    .trim()
    .toUpperCase()
    .regex(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
        "Invalid GST number format"
    );

/** IFSC code: AAAA0AAAAAA format */
export const zIFSC = z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format");

/** Aadhar number: exactly 12 digits */
export const zAadhar = z
    .string()
    .trim()
    .regex(/^\d{12}$/, "Aadhar number must be exactly 12 digits");

/** Indian pincode: exactly 6 digits */
export const zPincode = z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be exactly 6 digits");

/** Vehicle registration number: alphanumeric with dashes, 2–15 chars */
export const zRegNo = z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9\-]{2,15}$/, "Invalid vehicle registration number");

/** Vehicle year: 4-digit year between 1900 and current year + 1 */
export const zVehicleYear = z
    .number()
    .int()
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future");

// ─── Composite schemas ────────────────────────────────────────────────────────

/** Registration form */
export const registerSchema = z.object({
    name: zName,
    email: zEmail,
    password: zPassword,
});

/** Contact form */
export const contactSchema = z.object({
    name: zName,
    email: zEmail,
    phone: zPhone,
    subject: z.string().trim().min(1, "Subject is required").max(200, "Subject too long"),
    message: z.string().trim().min(1, "Message is required").max(2000, "Message too long (max 2000 characters)"),
});

/** Wizard lead */
export const wizardLeadSchema = z.object({
    serviceType: z.enum(["scrap", "sell", "buy", "exchange"], {
        errorMap: () => ({ message: "Invalid service type" }),
    }),
    name: zName,
    phone: zPhone,
    pincode: zPincode.optional(),
    regNo: zRegNo.optional(),
    year: zVehicleYear.optional(),
    brand: z.string().trim().max(100).optional(),
    model: z.string().trim().max(100).optional(),
    address: z.string().trim().max(500).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    kms: z.number().min(0).max(2000000).optional(),
    weight: z.union([z.string(), z.number()]).optional(),
    fuel: z.union([z.array(z.string()), z.string()]).optional(),
    buyNew: z.string().optional(),
    desiredCompany: z.string().trim().max(100).optional(),
    desiredModel: z.string().trim().max(100).optional(),
    carPhoto: z.string().url().optional(),
    ownerName: z.string().trim().max(100).optional(),
});

/** Admin: create scrap centre user */
export const createScrapUserSchema = z.object({
    name: zName,
    email: zEmail,
    loginId: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9.\-_]{3,50}$/, "Login ID must be 3–50 chars, alphanumeric with dots/dashes"),
    password: zPassword,
});

/** RVSF application */
export const rvsfApplySchema = z.object({
    legalEntityName: z.string().trim().min(2).max(200),
    gstNumber: zGST,
    panNumber: zPAN,
    cpcbAuthNumber: z.string().trim().min(1).max(100),
    morthAuthNumber: z.string().trim().min(1).max(100),
    businessEmail: zEmail,
    phoneNumber: zPhone,
    registeredAddress: z.string().trim().min(5).max(500),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    pincode: zPincode,
    accountHolderName: zName,
    bankName: z.string().trim().min(2).max(100),
    accountNumber: z.string().trim().regex(/^\d{9,18}$/, "Invalid bank account number"),
    ifscCode: zIFSC,
    accountType: z.enum(["savings", "current"], {
        errorMap: () => ({ message: "Account type must be savings or current" }),
    }),
});

/** Payment unlock: create order */
export const unlockOrderSchema = z.object({
    leadId: zMongoId,
    source: z.enum(["ExchangeVehicle", "BuyVehicle", "WizardLead"], {
        errorMap: () => ({ message: "Invalid lead source" }),
    }),
});

/** Payment unlock: verify */
export const unlockVerifySchema = z.object({
    razorpay_order_id: z.string().trim().min(1).max(100),
    razorpay_payment_id: z.string().trim().min(1).max(100),
    razorpay_signature: z.string().trim().min(1).max(256),
    leadId: zMongoId,
    source: z.enum(["ExchangeVehicle", "BuyVehicle", "WizardLead"], {
        errorMap: () => ({ message: "Invalid lead source" }),
    }),
    amount: z.number().min(0).optional(),
});

// ─── File validation ──────────────────────────────────────────────────────────

const IMAGE_MIME_ALLOWLIST = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const DOCUMENT_MIME_ALLOWLIST = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export interface FileValidationOptions {
    allowedMimeTypes?: string[];
    maxSizeBytes?: number;
    label?: string;
}

export function validateFile(
    file: File,
    opts: FileValidationOptions = {}
): { valid: true } | { valid: false; message: string } {
    const {
        allowedMimeTypes = IMAGE_MIME_ALLOWLIST,
        maxSizeBytes = 5 * 1024 * 1024, // 5 MB default
        label = "File",
    } = opts;

    if (!allowedMimeTypes.includes(file.type)) {
        return {
            valid: false,
            message: `${label}: unsupported file type "${file.type}". Allowed: ${allowedMimeTypes.join(", ")}`,
        };
    }

    if (file.size > maxSizeBytes) {
        const maxMB = (maxSizeBytes / 1024 / 1024).toFixed(0);
        return {
            valid: false,
            message: `${label}: file is too large (max ${maxMB} MB)`,
        };
    }

    return { valid: true };
}

export function validateImageFile(file: File, label = "File") {
    return validateFile(file, { allowedMimeTypes: IMAGE_MIME_ALLOWLIST, maxSizeBytes: 5 * 1024 * 1024, label });
}

export function validateDocumentFile(file: File, label = "File") {
    return validateFile(file, { allowedMimeTypes: DOCUMENT_MIME_ALLOWLIST, maxSizeBytes: 10 * 1024 * 1024, label });
}

// ─── HTML escape (for email templates) ───────────────────────────────────────

/**
 * Escape user-provided strings before interpolating into HTML email bodies.
 * Prevents XSS if malicious names/entities are stored in the DB.
 */
export function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// ─── Zod error formatter ─────────────────────────────────────────────────────

/**
 * Extract a readable first error message from a ZodError.
 */
export function formatZodError(error: z.ZodError): string {
    const issues = error.issues;
    if (issues.length === 0) return "Validation failed";
    return issues[0].message;
}
