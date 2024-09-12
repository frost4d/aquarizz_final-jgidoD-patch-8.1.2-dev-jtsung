import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/sdk-react";

const PayPalCheckout = ({ total, onSuccess }) => {
  return (
    <PayPalScriptProvider options={{ "client-id": "YOUR_CLIENT_ID" }}>
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: total,
              },
            }],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            onSuccess(details); // Process the payment on your server
          });
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalCheckout;
