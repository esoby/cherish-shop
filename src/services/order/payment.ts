import * as PortOne from "@portone/browser-sdk/v2";

export const createPaymentData = ({
  oid,
  orderName,
  orderPrice,
}: {
  oid: string;
  orderName: string;
  orderPrice: number;
}): PortOne.PaymentRequest => {
  return {
    storeId: import.meta.env.VITE_APP_PORTONE_STORE_ID,
    channelKey: import.meta.env.VITE_APP_PORTONE_CHANNEL_KEY,
    paymentId: `payment-${oid}`,
    orderName: orderName,
    totalAmount: orderPrice,
    currency: "CURRENCY_KRW",
    payMethod: "CARD",
  };
};
