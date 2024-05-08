import React from "react";
import { VStack, Box, Text, Button, Divider } from "@chakra-ui/react";
import CartItem from "./CartItem";

const CartListPage = ({ cartItems = [], setCartItems }) => {
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + Number(item.price), 0);
  };

  const removeFromCart = (index) => {
    const updatedCartItems = [...cartItems.slice(0, index), ...cartItems.slice(index + 1)];
    localStorage.setItem("wishlist", JSON.stringify(updatedCartItems));
    setCartItems(updatedCartItems);
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
            <Button colorScheme="yellow" bg="#FFC947">Proceed to Checkout</Button>
          </Box>
        </>
      )}
    </VStack>
  );
};

export default CartListPage;
