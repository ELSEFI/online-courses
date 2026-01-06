const crypto = require("crypto");

module.exports = function verifyPaymobHmac(req) {
  const receivedHmac = req.headers["hmac"];
  if (!receivedHmac) return false;

  const data = req.body.obj;

  const orderedFields = [
    data.amount_cents,
    data.created_at,
    data.currency,
    data.error_occured,
    data.has_parent_transaction,
    data.id,
    data.integration_id,
    data.is_3d_secure,
    data.is_auth,
    data.is_capture,
    data.is_refunded,
    data.is_standalone_payment,
    data.is_voided,
    data.order.id,
    data.owner,
    data.pending,
    data.source_data.pan,
    data.source_data.sub_type,
    data.source_data.type,
    data.success,
  ];

  const concatenated = orderedFields.join("");
  const calculatedHmac = crypto
    .createHmac("sha512", process.env.PAYMOB_HMAC_SECRET)
    .update(concatenated)
    .digest("hex");

  return calculatedHmac === receivedHmac;
};
