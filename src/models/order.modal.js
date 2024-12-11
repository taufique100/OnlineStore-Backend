import mongoose, { Schema } from "mongoose";

const OrderSchema = new Schema({
    customerId: { 
        type: Schema.Types.ObjectId,
        ref: 'Customer'
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }
}, { timestamps: true });

export const Order = mongoose.model('Order', OrderSchema);
