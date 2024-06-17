// ItemStatusPage.js
import "./ReportPage.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  VStack,
  Text,
  Divider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Center,
  Box,
  Image,
  Flex,
  Button,
} from "@chakra-ui/react";
import Navigation from "./Navigation";
import { useLocation } from "react-router-dom";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { UserAuth } from "../../context/AuthContext";

const statuses = [
  "All Order",
  "To Ship",
  "To Receive",
  "Completed",
  "Cancelled",
  "Refund",
];

const items = [
  {
    id: 1,
    name: "Item 1",
    status: "All Order",
    postImage: "image1.jpg",
    postTitle: "Item 1 Title",
    postContent: "Item 1 Content",
    price: 100,
  },
  {
    id: 2,
    name: "Item 2",
    status: "All Order",
    postImage: "image2.jpg",
    postTitle: "Item 2 Title",
    postContent: "Item 2 Content",
    price: 200,
  },
  {
    id: 3,
    name: "Item 3",
    status: "All Order",
    postImage: "image3.jpg",
    postTitle: "Item 3 Title",
    postContent: "Item 3 Content",
    price: 300,
  },
  {
    id: 4,
    name: "Item 4",
    status: "To Ship",
    postImage: "image4.jpg",
    postTitle: "Item 4 Title",
    postContent: "Item 4 Content",
    price: 400,
  },
  {
    id: 5,
    name: "Item 5",
    status: "To Ship",
    postImage: "image5.jpg",
    postTitle: "Item 5 Title",
    postContent: "Item 5 Content",
    price: 500,
  },
  {
    id: 6,
    name: "Item 6",
    status: "To Receive",
    postImage: "image6.jpg",
    postTitle: "Item 6 Title",
    postContent: "Item 6 Content",
    price: 600,
  },
  {
    id: 7,
    name: "Item 7",
    status: "Completed",
    postImage: "image7.jpg",
    postTitle: "Item 7 Title",
    postContent: "Item 7 Content",
    price: 700,
  },
  {
    id: 8,
    name: "Item 8",
    status: "Completed",
    postImage: "image8.jpg",
    postTitle: "Item 8 Title",
    postContent: "Item 8 Content",
    price: 800,
  },
  {
    id: 9,
    name: "Item 9",
    status: "Cancelled",
    postImage: "image9.jpg",
    postTitle: "Item 9 Title",
    postContent: "Item 9 Content",
    price: 900,
  },
  {
    id: 10,
    name: "Item 10",
    status: "Refund",
    postImage: "image10.jpg",
    postTitle: "Item 10 Title",
    postContent: "Item 10 Content",
    price: 1000,
  },
];

const ReportPage = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [currentSideTab, setCurrentSideTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const { user } = UserAuth();
  const location = useLocation();
  // const { checkedOutItems = [] } = location.state || {};
  const checkedOutItems = location.state?.checkedOutItems || [];
  const [cartItemCount, setCartItemCount] = useState(0);


  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     try {
  //       const ordersRef = collection(db, "payments");
  //       const querySnapshot = await getDocs(ordersRef);
  //       const fetchedOrders = [];
  //       querySnapshot.forEach((doc) => {
  //         fetchedOrders.push({ id: doc.id, ...doc.data() });
  //       });
  //       setOrders(fetchedOrders);
  //     } catch (error) {
  //       console.error("Error fetching orders: ", error);
  //     }
  //   };

  //   fetchOrders();
  // }, []);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const ordersRef = collection(db, "payments");
          // const querySnapshot = await getDocs(ordersRef);
          const querySnapshot = await getDocs(query(ordersRef, orderBy("createdAt", "desc")));
          const fetchedOrders = [];
          querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            orderData.cartItems.forEach((item) => {
              if (item.authorID === user.uid) {
                fetchedOrders.push({ id: doc.id, ...orderData });
              }
            });
          });
          setOrders(fetchedOrders);
        } catch (error) {
          console.error("Error fetching orders: ", error);
        }
      };

      fetchOrders();
    }
  }, [user]);

  const getStatusContent = (status) => {
    switch (status) {
      case "All Order":
        return "Display all orders here.";
      case "To Ship":
        return "Item is ready for shipping.";
      case "To Receive":
        return "Item is on its way to you.";
      case "Completed":
        return "Item has been delivered and transaction is completed.";
      case "Cancelled":
        return "Transaction for this item has been cancelled.";
      case "Refund":
        return "Refund for this item is in progress.";
      default:
        return "";
    }
  };

  const filterOrdersByStatus = (status) => {
    if (status === "All Order") {
      return orders;
    } else {
      return orders.filter((order) => order.status === status);
    }
  };

  const handleValidateStatus = async (orderId, currentStatus) => {
    try {
      let newStatus;
      switch (currentStatus) {
        case "All Order":
          newStatus = "To Ship";
          break;
        case "To Ship":
          newStatus = "To Receive";
          break;
        case "To Receive":
          newStatus = "Completed";
          break;
        default:
          newStatus = currentStatus;
      }

      const updatedOrders = orders.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });
      setOrders(updatedOrders);

      const orderRef = doc(db, "payments", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "payments", orderId);
      await updateDoc(orderRef, { status: "Cancelled" });
    } catch (error) {
      console.error("Error cancelling order: ", error);
    }
  };

  const handleRefundStatus = async (orderId) => {
    try {
      const orderRef = doc(db, "payments", orderId);
      await updateDoc(orderRef, { status: "Refund" });
    } catch (error) {
      console.error("Error refunding order: ", error);
    }
  };

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
      <Navigation
        cartItemCount={cartItemCount}
        setCartItemCount={setCartItemCount}
      />

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
            <Tabs isLazy index={currentTab} onChange={setCurrentTab} w="100%">
              <Box borderRadius="sm" boxShadow="md" p="4" w="100%">
                <TabList
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${statuses.length}, 1fr)`, // Set the columns based on the number of statuses
                    width: "100%",
                  }}
                >
                  {statuses.map((status, index) => (
                    <Tab key={index}>{status}</Tab>
                  ))}
                </TabList>
              </Box>
              <TabPanels>
                {statuses.map((status, index) => (
                  <TabPanel key={index}>
                    <VStack align="stretch" spacing="2">
                      <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                        Item Status: {status}
                      </Text>
                      <Divider />
                    </VStack>
                    {/* <Box borderRadius="lg" boxShadow="md" p="4" w="100%" h="auto"> */}

                    {/* <Text>{getStatusContent(status)}</Text> */}
                    {/* {checkedOutItems */}
                    {/* {orders.map(
                      (order) =>
                        order.items &&
                        order.items
                          .filter(
                            (item) =>
                              item.status === status || status === "All Order"
                          )
                          .map((item) => ( */}
                    {filterOrdersByStatus(status).map((item, index) => {
                      const customerName = item.customerName;
                      console.log("Customer Name:", customerName);
                      if (!customerName) {
                        console.log("Item without customer name:", item);
                      }
                      return (
                      <Flex
                        key={index}
                        p="2"
                        borderWidth="1px"
                        borderRadius="sm"
                        boxShadow="md"
                        mb="4"
                      >
                        <Image
                          src={item.cartItems[0].postImage}
                          alt={item.cartItems[0].postTitle}
                          boxSize="200px"
                          objectFit="cover"
                        />
                        <VStack align="stretch" ml="4">
                          <Text fontSize="md" fontWeight="bold">
                            Customer Name: {customerName}
                          </Text>
                          <Text fontSize="xl" fontWeight="bold">
                            Product Name: {item.cartItems[0].postTitle}
                          </Text>
                          <Text className="truncate" mr="4">
                            {item.cartItems[0].postContent}
                          </Text>

                          <Divider my={1} />
                          <Text fontWeight="bold">
                            Price: P{item.cartItems[0].price}
                          </Text>
                          <Text fontWeight="bold">
                            Quantity: {item.cartItems[0].quantity}
                          </Text>
                          <Text fontWeight="bold">
                            Shipping Fee: P{item.shippingFee}
                          </Text>
                          <Text fontWeight="bold">
                            Total Price: P{item.totalPrice}
                          </Text>
                          {(item.status === "To Ship" ||
                            item.status === "To Receive" ||
                            item.status === "Completed" ||
                            item.status === "Cancelled" ||
                            item.status === "Refund") && (
                            <Text fontWeight="bold" color="gray.500">
                              Status: {item.status}
                            </Text>
                          )}

                          <Button
                            colorScheme="green"
                            onClick={() =>
                              handleValidateStatus(item.id, status)
                            }
                            mt="2"
                          >
                            {/* Validate {status} */}
                            Validate {getStatusContent(status)}
                          </Button>

                          {status === "All Order" && (
                            <Button
                              colorScheme="red"
                              onClick={() => handleCancelOrder(item.id)}
                              mt="2"
                            >
                              Cancel Order
                            </Button>
                          )}

                          {status === "Completed" && (
                            <Button
                              colorScheme="red"
                              onClick={() => handleRefundStatus(item.id)}
                              mt="2"
                            >
                              Refund
                            </Button>
                          )}
                        </VStack>
                      </Flex>
                      )
})}
                    {/* )} */}

                    {/* </Box> */}
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </Box>
        </Flex>
      </VStack>
    </Box>
  );
};

export default ReportPage;
