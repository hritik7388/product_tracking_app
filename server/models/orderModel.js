const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  address: {
    flat: String,
    houseNumber: String,
    floor: String,
    area: String,
    sector: String
  },

  phoneNumber: String,

  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      price: Number,
      itemTotal: Number
    }
  ],

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending'
  },

  paymentMethod: {
    type: String,
    enum: ['COD', 'Stripe'],
    default: 'COD'
  },

  stripePaymentIntentId: String,         // Stripe's PaymentIntent ID
  stripeCustomerId: String,              // Stripe's Customer ID (if applicable)
  stripeSessionId: String,               // For Checkout Sessions
  stripePaymentStatus: {
    type: String,
    enum: ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'canceled'],
    default: 'requires_payment_method'
  },

  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  orderDate: { type: Date, default: Date.now },

  totalAmount: Number,

  status: {
    type: String,
    enum: ['created', 'paid', 'failed'],
    default: 'created'
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
}, { timestamps: true });

orderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
