import React, { useState, useEffect } from "react";
import { VStack, Text, Image, Divider, Flex, Box, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";

const PaymentPage = () => {
  const location = useLocation();
  const { cartItems = [], totalPrice = 0, paymentMethod = "", shippingFee = 0 } = location.state || {};
  const navigate = useNavigate();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  useEffect(() => {
    if (paymentInitiated) {
      const timeout = setTimeout(() => {
        setPaymentSuccess(true);
        onOpen(); // Open the modal when payment is successful
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [paymentInitiated, onOpen]);

  const handleProceedToPayment = () => {
    setPaymentInitiated(true);
    navigate("/ItemStatusPage", { state: { checkedOutItems: cartItems } });
  };

  if (!location.state || cartItems.length === 0) {
    console.error("Error: No data received from the previous page.");
    return (
      <VStack align="stretch" spacing="4" p="4">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Error: No data received from the previous page.
        </Text>
      </VStack>
    );
  }

  return (
    <Box>
      <Navigation />
      <VStack align="stretch" spacing="4" p="4">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Payment Details
        </Text>
        <Box borderRadius="sm" boxShadow="lg" borderWidth="1px" p="4" w="100%">
          <Text mx="10%" fontWeight="bold">Total Price: P{totalPrice}</Text>
          <Text mx="10%" fontWeight="bold">Shipping Fee: P{shippingFee}</Text>
          <Text mx="10%" fontWeight="bold">Payment Method: {paymentMethod}</Text>
          {cartItems.map((item, index) => (
            <Flex key={index} justifyContent="center" w="100%">
              <VStack
                key={index}
                align="stretch"
                spacing="2"
                p="2"
                borderWidth="1px"
                borderRadius="lg"
                w="80%"
              >
                <Flex>
                  <Image
                    src={item.postImage}
                    alt={item.postTitle}
                    boxSize="100px"
                    objectFit="cover"
                  />
                  <VStack align="stretch" ml="4">
                    <Text fontSize="xl" fontWeight="bold">
                      {item.postTitle}
                    </Text>
                    <Text>{item.postContent}</Text>
                    <Divider my={1} />
                    <Text fontWeight="bold">Price: P{item.price}</Text>
                  </VStack>
                </Flex>
              </VStack>
            </Flex>
          ))}
        </Box>
      </VStack>
      {paymentSuccess && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Payment Successful!</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Your payment has been successfully processed.
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
       <Flex justify="center" align="center" mb="4">
      <Button colorScheme="blue" onClick={handleProceedToPayment}>
        View your item status
      </Button>
      </Flex>
    </Box>
  );
};

export default PaymentPage;
