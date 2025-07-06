const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual để populate products
// comboSchema.virtual("products", {
//   ref: "ComboProduct",
//   localField: "_id",
//   foreignField: "combo_id",
//   justOne: false, // Đảm bảo trả về array
// });


module.exports = mongoose.model("Category", categorySchema);
