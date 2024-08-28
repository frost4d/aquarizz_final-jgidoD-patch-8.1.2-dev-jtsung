import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { format } from "date-fns";
import {
  HStack,
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
  const [totalSales, setTotalSales] = useState(0);
  const [soldProducts, setSoldProducts] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsRef = collection(db, "payments");
        const querySnapshot = await getDocs(query(transactionsRef, orderBy("createdAt", "desc")));
        const fetchedTransactions = [];
        let sales = 0;
        let productsSold = 0;

        querySnapshot.forEach((doc) => {
          const transactionData = doc.data();
          transactionData.cartItems.forEach((item) => {
            if (item.authorID === user.uid) {
              fetchedTransactions.push({ id: doc.id, ...transactionData });
              const priceWithFeeDeducted = item.price * 0.92;
              sales += priceWithFeeDeducted * item.quantity;
              productsSold += item.quantity;
            }
          });
        });

        setTransactions(fetchedTransactions);
        setTotalSales(sales);
        setSoldProducts(productsSold);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
      }
    };

    fetchTransactions();
  }, [user.uid]);


  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const cartItemsRef = collection(db, "payments");
        const q = query(cartItemsRef, where("status", "==", "Completed"));
        const querySnapshot = await getDocs(q);
        const fetchedReviews = [];
        let totalRating = 0;
        let numRatings = 0;

        querySnapshot.forEach((doc) => {
          const cartItemData = doc.data();
          fetchedReviews.push({ id: doc.id, ...cartItemData });
          cartItemData.cartItems.forEach((item) => {
            totalRating += item.rating || 0;
            numRatings++;
          });
        });

        if (numRatings > 0) {
          setAvgRating(totalRating / numRatings);
        } else {
          setAvgRating(0);
        }

        console.log("Fetched reviews:", fetchedReviews); // Log fetched reviews for debugging
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews: ", error);
      }
    };

    // const checkShop = async () => {

    //   const shopRef = collection(db, "shop");
    //   const q = query(shopRef, where("authorID", "==", userId));
    //   const docSnap = await getDocs(q);
    //   if (docSnap.docs.length === 0) {
    //     console.log("doesn't exist" + userId);
    //     setHasShop(false);
    //   } else {
    //     setHasShop(true);
    //   }
    // };
    // checkShop();
    fetchReviews();
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

            <HStack>
            <Box p="4" my="4" borderWidth="2px" boxShadow="md" minWidth="350px">
                <Center>
                  <VStack>
              <Text fontSize="2xl" fontWeight="bold">
                Total Sales: 
                </Text>
              <Text fontSize="4xl" fontWeight="bold">  
                P{totalSales.toFixed(2)}
              </Text>
              </VStack>
              </Center>
            </Box>
            <Box p="4" my="4" borderWidth="2px" boxShadow="md" minWidth="350px">
              <Center>
                <VStack>
              <Text fontSize="2xl" fontWeight="bold">
                Total Products Sold: 
              </Text>
              <Text fontSize="4xl" fontWeight="bold">        
                {soldProducts}
              </Text>
              </VStack>
              </Center>
            </Box>
            <Box p="4" my="4" borderWidth="2px" boxShadow="md" minWidth="350px">
              <Center>
                <VStack>
              <Text fontSize="2xl" fontWeight="bold">
                Total Ratings: 
              </Text>
              <Text fontSize="4xl" fontWeight="bold">{avgRating.toFixed(1)} / 5 ({reviews.length} ratings)</Text>
              </VStack>
              </Center>
            </Box>
            </HStack>
            
            {loading ? (
              <Flex w="100%" h="100vh" align="center" justify="center">
                <span className="loader"></span>
              </Flex>
            ) : (
              // transactions.map((transaction) => (
                currentItems.map((transaction) => {
                  const totalPriceWithFeeDeducted = transaction.cartItems.reduce((acc, item) => {
                    if (item.authorID === user.uid) {
                      return acc + (item.price * item.quantity * 0.92);
                    }
                    return acc;
                  }, 0);

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
                          <Text fontSize="md" fontWeight="bold">Customer Name: {transaction.customerName}</Text>
                          <Text fontSize="md" fontWeight="bold">
                            Payment Method: {transaction.paymentMethod}
                          </Text>
                          <Text fontSize="md" fontWeight="bold">Total Price: P{item.price * item.quantity}</Text>
                          {/* <Text fontSize="md" fontWeight="bold">Status: {transaction.status}</Text> */}
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
