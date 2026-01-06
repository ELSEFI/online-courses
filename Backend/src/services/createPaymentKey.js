async function createPaymentKey(authToken, orderId, amount, user) {
  const res = await axios.post(
    `${process.env.PAYMOB_API_URL}/acceptance/payment_keys`,
    {
      auth_token: authToken,
      amount_cents: amount * 100,
      expiration: 3600,
      order_id: orderId,
      currency: "EGP",
      integration_id: Number(process.env.PAYMOB_INTEGRATION),
      billing_data: {
        first_name: user.name || "User",
        last_name: "Online",
        email: user.email,
        phone_number: user.phone || "01000000000",
        country: "EG",
        city: "Cairo",
        street: "NA",
        building: "NA",
        floor: "NA",
        apartment: "NA",
      },
    }
  );
  return res.data.token;
}
