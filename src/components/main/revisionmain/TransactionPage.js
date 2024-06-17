import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { format } from "date-fns";
import {
  VStack,
  Text,
  Divider,
  Center,
  Box,
  Flex,
  Button,
  Image
} from "@chakra-ui/react";
import Navigation from "./Navigation";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";

const TransactionPage = () => {
  const { user } = UserAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsRef = collection(db, "payments");
        // const querySnapshot = await getDocs(transactionsRef);
        const querySnapshot = await getDocs(query(transactionsRef, orderBy("createdAt", "desc")));
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleManageClick = () => {
    // Handle the click event here, e.g., navigate to the reviews page
    navigate(`/profile/${user.uid}`);
  };
  const handleOrdersClick = () => {
    // Handle the click event here, e.g., navigate to the reviews page
    navigate(`/reports`);
  };
  const handleReviewsClick = () => {
    // Handle the click event here, e.g., navigate to the reviews page
    navigate("/transaction");
  };

  return (
    <Box>
      <Navigation cartItemCount={cartItemCount} setCartItemCount={setCartItemCount}/>

      <VStack align="stretch" spacing="4" p="4">
        <Flex>
          <Box
            w="26%"
            h="28vh"
            // borderWidth="2px"
            // borderColor="red"
            py="8"
            mr="4"
            boxShadow="md"
          >
            <Center>
              <VStack align="stretch" spacing="6">
                <Text
                  fontWeight="bold"
                  cursor="pointer"
                  onClick={handleManageClick}
                >
                  Manage Account
                </Text>
                <Text
                  fontWeight="bold"
                  cursor="pointer"
                  onClick={handleOrdersClick}
                >
                  Orders
                </Text>
                <Text
                  fontWeight="bold"
                  cursor="pointer"
                  onClick={handleReviewsClick}
                >
                  Transaction
                </Text>
              </VStack>
            </Center>
          </Box>
          <Box w="100%">
            <Center borderWidth="4px" borderColor="black">
              <Text fontSize="2xl" fontWeight="bold" my="4">
                Transaction Details
              </Text>
            </Center>
            <Divider />
            {loading ? (
              <Flex w="100%" h="100vh" align="center" justify="center">
                <span className="loader"></span>
              </Flex>
            ) : (
              // transactions.map((transaction) => (
              currentItems.map((transaction) => {
                const totalPriceWithFeeDeducted = transaction.totalPrice * 0.92;

                return (
                  <Center>
                    <Box
                      key={transaction.id}
                      p="4"
                      borderWidth="2px"
                      borderRadius="md"
                      w="100%"
                      my="2"
                    >
                      <Text fontWeight="bold">
                        Transaction ID: {transaction.id}
                      </Text>
                      {transaction.cartItems.map((item) => (
                        // <Box key={item.id}>
                        <Flex key={item.id} mt="2" align="center">
                          <Image src={item.postImage} alt={item.postTitle} boxSize="200px" objectFit="cover" />
                          <Box ml="4" >
                          <Text fontSize="md" fontWeight="bold">Product Name: {item.postTitle}</Text>
                          <Text fontSize="md" fontWeight="bold">Quantity: {item.quantity}</Text>
                          <Text fontSize="md" fontWeight="bold">Price: {item.price}</Text>
                
                          {/* </Box>
              ))} */}
                          <Text fontSize="md" fontWeight="bold">Customer Name: {item.customerName}</Text>
                          <Text fontSize="md" fontWeight="bold">
                            Payment Method: {transaction.paymentMethod}
                          </Text>
                          <Text fontSize="md" fontWeight="bold">Total Price: P{transaction.totalPrice}</Text>
                          <Text fontSize="md" fontWeight="bold">
                            Total Price with Fee Deducted: {" "}P
                            {totalPriceWithFeeDeducted.toFixed(2)}
                          </Text>
                          {/* <Text>Date: {format(transaction.createdAt.toDate(), 'yyyy-MM-dd')}</Text> */}
                          <Text fontSize="md" fontWeight="bold">
                            Date:{" "}
                            {transaction.createdAt
                              ? format(
                                  transaction.createdAt.toDate(),
                                  "yyyy-MM-dd"
                                )
                              : "N/A"}
                          </Text>
                          </Box>
                        </Flex>
                      ))}
                    </Box>
                  </Center>
                );
              })
            )}
            <Flex justify="center" mt="4">
              {[
                ...Array(Math.ceil(transactions.length / itemsPerPage)).keys(),
              ].map((number) => (
                <Button
                  key={number}
                  onClick={() => paginate(number + 1)}
                  mx="1"
                >
                  {number + 1}
                </Button>
              ))}
            </Flex>
          </Box>
        </Flex>
      </VStack>
    </Box>
  );
};

export default TransactionPage;
