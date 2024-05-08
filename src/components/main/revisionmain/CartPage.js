import React, { useState, useEffect } from "react";
import { ChakraProvider, VStack } from "@chakra-ui/react";
import CartListPage from "./CartListPage";
import Navigation from "./Navigation";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

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
    <ChakraProvider>
        <Navigation />
      <VStack align="center" spacing="4" p="4">
        <CartListPage cartItems={cartItems} setCartItems={setCartItems} />
      </VStack>
    </ChakraProvider>
  );
};

export default CartPage;
