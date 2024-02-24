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
    storeId: "store-d2497df4-ff5f-445c-82ad-177f0570aa47",
    channelKey: "channel-key-1a6dccc0-bc6a-4b8c-96e6-18f7d9c9a928",
    paymentId: `payment-${oid}`,
    orderName: orderName,
    totalAmount: orderPrice,
    currency: "CURRENCY_KRW",
    payMethod: "CARD",
  };
};
