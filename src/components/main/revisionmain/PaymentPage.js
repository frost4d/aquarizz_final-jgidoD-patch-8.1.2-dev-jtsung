import React, { useState, useEffect } from "react";
import { VStack, Text, Image, Divider, Flex, Box, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Heading } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import { db } from "../../../firebase/firebaseConfig";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
const PaymentPage = () => {
  const location = useLocation();
  const { cartItems = [], totalPrice = 0, paymentMethod = "", shippingFee = 0 } = location.state || {};
  const navigate = useNavigate();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [checkedOutItems, setCheckedOutItems] = useState([]);

  useEffect(() => {
    const fetchCheckedOutItems = async () => {
      console.log("Fetching checked out items...");
      const q = query(collection(db, "payments"), 
      where("paymentMethod", "==", paymentMethod),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    try {
      const querySnapshot = await getDocs(q);
      console.log("Query Snapshot:", querySnapshot);
      const items = [];
      querySnapshot.forEach((doc) => {
        const cartItems = doc.data().cartItems.map((item) => ({
          ...item,
          id: doc.id, // Assuming the item ID is the document ID in Firestore
        }));
        items.push(...doc.data().cartItems);
      });
      console.log("Fetched items:", items);
      setCheckedOutItems(items);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
      
      // const querySnapshot = await getDocs(q);
      // console.log("Query Snapshot:", querySnapshot);
      // const items = [];
      // querySnapshot.forEach((doc) => {
      //   items.push(...doc.data().cartItems);
      // });
      // console.log("Fetched items:", items);
      // setCheckedOutItems(items);
    };

    fetchCheckedOutItems();
  }, [paymentMethod]);
  
  useEffect(() => {
    if (checkedOutItems.length > 0) {
      // Simulate payment success after 2 seconds
      const timeout = setTimeout(() => {
        setPaymentSuccess(true);
        onOpen(); // Open the modal when payment is successful
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [checkedOutItems, onOpen]);

  const handleProceedToPayment = () => {
    setPaymentInitiated(true);
    setCheckedOutItems(cartItems);
    navigate("/ItemStatusPage", { state: { checkedOutItems: cartItems } });
  };
  // useEffect(() => {
  //   if (paymentInitiated) {
  //     const timeout = setTimeout(() => {
  //       setPaymentSuccess(true);
  //       onOpen(); // Open the modal when payment is successful
  //     }, 2000);

  //     return () => clearTimeout(timeout);
  //   }
  // }, [paymentInitiated, onOpen]);

  // const handleProceedToPayment = () => {
  //   setPaymentInitiated(true);
  //   setCheckedOutItems(cartItems);
  //   navigate("/ItemStatusPage", { state: { checkedOutItems: cartItems } });
  // };

  // if (!location.state || cartItems.length === 0) {
  //   console.error("Error: No data received from the previous page.");
  //   return (
  //     <VStack align="stretch" spacing="4" p="4">
  //       <Text fontSize="2xl" fontWeight="bold" textAlign="center">
  //         Error: No data received from the previous page.
  //       </Text>
  //     </VStack>
  //   );
  // }

  return (
    <Box>
      <Navigation />
      <VStack align="stretch" spacing="4" p="4">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Payment Details
        </Text>
        <Box borderRadius="sm" boxShadow="lg" borderWidth="1px" p="4" w="100%">
          <Text mx="10%" fontWeight="bold">Total Price: P{totalPrice}</Text>
          <Text mx="10%" fontWeight="bold">Quantity: {checkedOutItems.reduce((acc, item) => acc + item.quantity, 0)}</Text>
          <Text mx="10%" fontWeight="bold">Shipping Fee: P{shippingFee}</Text>
          <Text mx="10%" fontWeight="bold">Payment Method: {paymentMethod}</Text>
          {/* {cartItems.map((item, index) => ( */}
          {checkedOutItems.map((item, index) => (
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
            <ModalHeader>
              <Heading size="md">
              Order Placed!
              </Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Your order has been successfully processed.
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
       <Flex justify="center" align="center" mb="4">
      {/* <Button colorScheme="blue" onClick={handleProceedToPayment}>
        View your item status
      </Button> */}
      </Flex>
    </Box>
  );
};

export default PaymentPage;
