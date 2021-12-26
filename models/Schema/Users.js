const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    fname: {
        type: String,
        required: true,
    },
    lname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    // notification: [mongoose.SchemaType.ObjectId],
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    isValidated: {
        type: Boolean,
        default: false,
    },
    lastUpdate: Date,
    notifications: [{
        isRead: {
            type: Boolean,
            default: false
        },
        notificationID: { type: mongoose.Schema.Types.ObjectId }
    }]
});
UserSchema.pre('save', function (next) {
    this.lastUpdate = Date.now();
    next();
})


// const User = mongoose.model('User', UserSchema);

module.exports = UserSchema;
