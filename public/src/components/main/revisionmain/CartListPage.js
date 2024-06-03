import React from "react";
import { VStack, Box, Text, Divider, Button } from "@chakra-ui/react";
import CartItem from "./CartItem";
import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; // Change import path

const CartListPage = ({ cartItems = [], setCartItems }) => {
  const navigate = useNavigate();

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + Number(item.price), 0);
  };

  const removeFromCart = (index) => {
    const updatedCartItems = [...cartItems.slice(0, index), ...cartItems.slice(index + 1)];
    localStorage.setItem("wishlist", JSON.stringify(updatedCartItems));
    setCartItems(updatedCartItems);
  };

  const proceedToCheckout = () => {
    setCartItems([]); // Clear the cart
    navigate("/checkout", { state: { cartItems, totalPrice: getTotalPrice() } });
  };

  const handlePayPalSuccess = (details) => {
    // Process the payment on your server using details
    console.log("Payment successful. Details:", details);
    proceedToCheckout(); // Navigate or perform any action after successful payment
  };

  return (
    <VStack align="stretch" spacing="4" p="4" justify="center">
      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
        Your Cart
      </Text>
      {cartItems.length === 0 ? (
        <Text>Your cart is empty.</Text>
      ) : (
        <>
          {cartItems.map((item, index) => (
            <CartItem key={index} item={item} onRemove={() => removeFromCart(index)} />
          ))}
          <Box mt="auto" textAlign="end" mr={10}>
            <Text fontSize="xx-large" fontWeight="bold">
              Total: P{getTotalPrice()}
            </Text>
            <Divider my={3} />
            <PayPalScriptProvider options={{ "client-id": "YOUR_CLIENT_ID" }}>
              <PayPalButtons
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: getTotalPrice(),
                        },
                      },
                    ],
                  });
                }}
                onApprove={(data, actions) => {
                  return actions.order.capture().then((details) => {
                    handlePayPalSuccess(details);
                  });
                }}
              />
            </PayPalScriptProvider>
            <Button colorScheme="yellow" bg="#FFC947" onClick={proceedToCheckout}>
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
    </VStack>
  );
};

export default CartListPage;
