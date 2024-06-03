import React, { useState } from "react";
import { VStack, Text, Input, Select, Button, Box } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import CartItem from "./CartItem";
import Navigation from "./Navigation";

const CheckoutDetailsPage = () => {
  const location = useLocation();
  const { cartItems = [], totalPrice = 0 } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingFee, setShippingFee] = useState(50);
  const navigate = useNavigate();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [checkedOutItems, setCheckedOutItems] = useState([]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleShippingFeeChange = (e) => {
    setShippingFee(e.target.value);
  };

  const handleProceedToPayment = () => {
    if (cartItems.length > 0) {
      setCheckedOutItems(cartItems);
      // Pass a callback to setPaymentInitiated in PaymentPage.js
      setPaymentInitiated(() => {
        navigate("/payment", { state: { cartItems, totalPrice, paymentMethod, shippingFee, checkedOutItems: cartItems } });
        return true;
      });
    } else {
      console.error("Error: No data received from the previous page.");
    }
  };
  
  return (
    <Box>
        <Navigation />
    <VStack align="stretch" spacing="4" p="4">
      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
        Checkout Details
      </Text>
      {cartItems.map((item, index) => (
        <CartItem key={index} item={item} onRemove={() => {}} />
      ))}
      <Text fontWeight="bold">Total Price: P{totalPrice}</Text>
      <Text fontWeight="bold">Shipping Fee: P{shippingFee}</Text>
      <Select placeholder="Select Payment Method" value={paymentMethod} onChange={handlePaymentMethodChange}>
        <option value="cod">Cash on Delivery (COD)</option>
        <option value="gcash">GCash</option>
        <option value="googlePay">Google Pay</option>
      </Select>
      <Button colorScheme="blue" onClick={handleProceedToPayment}>
        Proceed to Payment
      </Button>
    </VStack>
    </Box>
  );
};

export default CheckoutDetailsPage;
