import mongoose, { Schema } from 'mongoose';

const deliverySchema = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        deliveryPersonId: {
            type: Schema.Types.ObjectId,
            ref: 'User', // assuming delivery person is also stored in 'User' collection
        },
        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: 'Vehicle',
        },
        deliveryAddress: {
            flat: { type: String },
            houseNumber: { type: String },
            floor: { type: String },
            area: { type: String },
            sector: { type: String },
            phoneNumber: { type: String }

        },
        deliveryStatus: {
            type: String,
            enum: ['assigned', 'on_the_way', 'delivered', 'cancelled'],
            default: 'assigned',
        },
        userLocation: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0],
            },
        },
        currentLocation: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0],
            },
        },
        estimatedArrivalTimeInMinutes: {
            type: Number,
            default: 5,
        },
        deliveryStartTime: Date,
        deliveryEndTime: Date,
    },
    {
        timestamps: true,
        collection: 'delivery',
    }
);

// GeoIndexes for location queries
deliverySchema.index({ userLocation: '2dsphere' });
deliverySchema.index({ currentLocation: '2dsphere' });

export default mongoose.model('Delivery', deliverySchema);
