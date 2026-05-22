import mongoose, { Schema, model, models } from "mongoose"

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            unique: true,
            sparse: true, // allows multiple docs with no email
            required: false,
            match: [
                // Relaxed v2 regex — original rejected `.online` and other 4+ char TLDs
                // (Novalytix's regex only allowed 2-3 char TLDs).
                /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/,
                "Email is invalid",
            ],
        },
        password: {
            type: String,
            required: false, // Optional for OAuth users
            select: false,
        },
        image: {
            type: String,
        },
        provider: {
            type: String,
            default: "credentials",
        },
        role: {
            type: String,
            // v2 unified taxonomy per v2-build-plan §22 Conflict 1 + §25 overlay.
            // Legacy enum was ["client","admin","b2b"]; expanded so that
            // partner/executive/cc_operator/rvsf_admin/rvsf_executive users
            // live in the same User collection (with linkedRvsfId/linkedCcId).
            enum: [
                "client",
                "admin",
                "executive",
                "rvsf_admin",
                "rvsf_executive",
                "cc_operator",
                // legacy values retained so Novalytix-seeded users
                // (b2b/partner/rvsf/scrapcentre) keep loading; the v2
                // migration script normalises them to the new taxonomy.
                "b2b",
                "partner",
                "rvsf",
                "scrapcentre",
            ],
            default: "client",
        },
        phone: {
            type: String,
            unique: true,
            sparse: true,
            required: false,
        },
        // ── v2 additions ────────────────────────────────────────────────
        firebaseUid: {
            type: String,
            unique: true,
            sparse: true,
        },
        linkedRvsfId: {
            type: Schema.Types.ObjectId,
            ref: "RVSF",
            // non-null for rvsf_admin / rvsf_executive
        },
        linkedCcId: {
            type: Schema.Types.ObjectId,
            ref: "CollectionCenter",
            // non-null for cc_operator
        },
        mustChangePassword: {
            type: Boolean,
            default: false,
            // true on first login for auto-generated CC operator + RVSF admin accounts
        },
        lastLoginAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
)

// Index supporting "list staff under this RVSF" queries
UserSchema.index({ role: 1, linkedRvsfId: 1 })

const User = models.User || model("User", UserSchema)

export default User

