import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { format } from 'date-fns';
import {
  VStack,
  Text,
  Divider,
  Center,
  Box,
  Flex
} from "@chakra-ui/react";
import Navigation from "./Navigation";

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsRef = collection(db, "payments");
        const querySnapshot = await getDocs(transactionsRef);
        const fetchedTransactions = [];
        querySnapshot.forEach((doc) => {
          fetchedTransactions.push({ id: doc.id, ...doc.data() });
        });
        setTransactions(fetchedTransactions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <Box>
      <Navigation />

      <VStack align="stretch" spacing="4" p="4">
        <Center>
          <Text fontSize="2xl" fontWeight="bold" mb="4">Transaction Details</Text>
        </Center>
        <Divider />
        {loading ? (
          <Flex w="100%" h="100vh" align="center" justify="center">
          <span className="loader"></span>
        </Flex>
        ) : (
          transactions.map((transaction) => (
            <Center>
            <Box key={transaction.id} p="4" borderWidth="1px" borderRadius="md" w="70%">
              <Text fontWeight="bold">Transaction ID: {transaction.id}</Text>
              {transaction.cartItems.map((item) => (
                <Box key={item.id}>
              <Text>Product Name: {item.postTitle}</Text>
              <Text>Quantity: {item.quantity}</Text>
                  <Text>Price: {item.price}</Text>
                {/* </Box>
              ))} */}
              <Text>Customer Name: {transaction.name}</Text>
              <Text>Payment Method: {transaction.paymentMethod}</Text>
              <Text>Total Price: {transaction.totalPrice}</Text>
              {/* <Text>Date: {format(transaction.createdAt.toDate(), 'yyyy-MM-dd')}</Text> */}
              <Text>Date: {transaction.createdAt ? format(transaction.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</Text>
              </Box>
            ))}
              {/* Add more details as needed */}
            </Box>
            </Center>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default TransactionPage;
