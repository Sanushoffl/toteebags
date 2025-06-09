import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: [String] },
  stockQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: function() {
      return this.stockQuantity > 0;
    }
  },
  bestseller: { type: Boolean }
});

// Add a pre-save middleware to update inStock based on stockQuantity
productSchema.pre('save', function(next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;