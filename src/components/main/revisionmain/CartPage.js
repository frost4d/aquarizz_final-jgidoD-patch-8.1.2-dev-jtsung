import React, { useState, useEffect } from "react";
import { ChakraProvider, VStack, Box, Flex } from "@chakra-ui/react";
import CartListPage from "./CartListPage";
import Navigation from "./Navigation";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  

  // Example function to add items to the cart
  const addToCart = (item) => {
    const existingItems = JSON.parse(localStorage.getItem("wishlist")) || [];
    const updatedItems = [...existingItems, item];
    localStorage.setItem("wishlist", JSON.stringify(updatedItems));
    setCartItems(updatedItems);
  };

  useEffect(() => {
    const existingItems = JSON.parse(localStorage.getItem("wishlist")) || [];
    setCartItems(existingItems);
  }, []);

  return (
    <Flex flexDirection="column">
    <Box h="75vh">
    <ChakraProvider>
        <Navigation cartItemCount={cartItemCount} setCartItemCount={setCartItemCount}/>
      <VStack align="center" spacing="4">
        <CartListPage cartItems={cartItems} setCartItems={setCartItems} />
      </VStack>
    </ChakraProvider>
    </Box>
      </Flex>
  );
};

export default CartPage;
