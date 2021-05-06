const mongoose = require("mongoose");
const { populatePrivate } = require('./index');

/**
 *  Parent Model
 */
const parentSchema = new mongoose.Schema({
    _oneOfOne: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Child",
        private: true,
        privateRef: true,
    },
    _oneOfMany: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        private: true,
        privateRef: true
    }],
    github: { type: String, lowercase: true, default: "https://github.com/obe711/mongoose-populate-plugin" },
    docs: {
        type: String,
        lowercase: true,
        default: "https://sigconsultingservices.com/wiki"
    },
    mongoose: { type: String, default: "^5.7.7" }

}, { timestamps: true });

parentSchema.plugin(populatePrivate)

const Parent = mongoose.model("Parent", parentSchema);

exports.Parent = Parent;

/**
 *  Child Model
 */
const childSchema = new mongoose.Schema({
    project: { type: String, default: "quickbase-to-mongo" },
    github: { type: String, lowercase: true, default: "https://github.com/obe711/quickbase-to-mongo" },
    docs: {
        type: String,
        lowercase: true,
        default: "https://sigconsultingservices.com/wiki"
    },
    mongoose: { type: String, default: "^5.6.9" }

}, { timestamps: true });

childSchema.plugin(populatePrivate)

const Child = mongoose.model("Child", childSchema);

exports.Child = Child;

