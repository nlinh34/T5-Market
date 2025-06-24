const Joi = require("joi");

exports.validateOrder = (data) => {
  const schema = Joi.object({
    shippingInfo: Joi.object({
      fullName: Joi.string().required().messages({
        "string.empty": "Vui lòng nhập họ tên",
        "any.required": "Vui lòng nhập họ tên",
      }),
      phoneNumber: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
          "string.pattern.base": "Số điện thoại không hợp lệ",
          "any.required": "Vui lòng nhập số điện thoại",
        }),
      fullAddress: Joi.string().required().messages({
        "string.empty": "Vui lòng nhập địa chỉ",
        "any.required": "Vui lòng nhập địa chỉ",
      }),
      note: Joi.string().allow("", null),
    }),
    order: Joi.object({
      items: Joi.array()
        .items(
          Joi.object({
            productId: Joi.string().required(),
            name: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required(),
            price: Joi.number().min(0).required(),
          })
        )
        .required(),
      subTotal: Joi.number().min(0).required(),
      shippingFee: Joi.number().min(0).required(),
      discount: Joi.number().default(0),
      totalAmount: Joi.number().min(0).required(),
    }),
    deliveryTime: Joi.string().valid("now", "later").required(),
    deliveryDate: Joi.when("deliveryTime", {
      is: "later",
      then: Joi.date().greater("now").required(),
      otherwise: Joi.optional(),
    }),
    deliveryHour: Joi.when("deliveryTime", {
      is: "later",
      then: Joi.string().required(),
      otherwise: Joi.optional(),
    }),
    paymentMethod: Joi.string()
      .valid("COD", "momo", "bank", "credit")
      .required(),
  });

  return schema.validate(data);
};
