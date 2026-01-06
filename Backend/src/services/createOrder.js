async function createOrder(authToken, amount, paymentId) {
  const res = await axios.post(
    `${process.env.PAYMOB_API_URL}/ecommerce/orders`,
    {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amount * 100,
      currency: "EGP",
      merchant_order_id: paymentId.toString(),
      items: [],
    }
  );
  return res.data.id;
}
