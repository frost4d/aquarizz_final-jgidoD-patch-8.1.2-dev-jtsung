import React, { useState, useEffect } from "react";
import { VStack, Text, Divider, Box, Image, Flex } from "@chakra-ui/react";
import Navigation from "./Navigation";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, query, where, doc, updateDoc, getDoc } from "firebase/firestore";
import StarRating from "./StarRating"; // Import the StarRating component
import Sidebar from "./Sidebar";

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

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

    fetchReviews();
  }, []);

  const handleRate = async (itemId, rating) => {
    try {
      console.log("Updating rating for item:", itemId, "to", rating);
  
      // Get the reference to the payments collection
      const paymentsRef = collection(db, "payments");
      // Query to get all completed payment documents
      const q = query(paymentsRef, where("status", "==", "Completed"));
      const querySnapshot = await getDocs(q);
  
      // Iterate over each document in the querySnapshot
      for (const docSnapshot of querySnapshot.docs) {
        const paymentRef = doc(db, "payments", docSnapshot.id);
        const paymentDoc = await getDoc(paymentRef);
  
        if (paymentDoc.exists()) {
          const paymentData = paymentDoc.data();
          const updatedCartItems = paymentData.cartItems.map((item) => {
            if (item.id === itemId) {
              return { ...item, rating: rating };
            }
            return item;
          });
  
          // Check if any item was updated
          if (JSON.stringify(updatedCartItems) !== JSON.stringify(paymentData.cartItems)) {
            // Update the payment document with the updated cartItems array
            await updateDoc(paymentRef, { cartItems: updatedCartItems });
            console.log("Rating updated successfully for item:", itemId);
            return; // Exit after updating the rating
          }
        } else {
          console.error("Payment document does not exist for itemId:", itemId);
        }
      }
  
      console.error("No payment document contains the specified itemId:", itemId);
    } catch (error) {
      console.error("Error updating rating for item:", itemId, ":", error);
      if (error.code === "permission-denied") {
        console.error("Make sure you have permission to access this document.");
      }
    }
  };
  
  
  return (
    <Box>
      <Navigation />
      <Flex>
        <Sidebar />
      <VStack align="stretch" spacing="4" p="4" w="80%">
        <VStack align="stretch" spacing="2">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Reviews for Completed Items
          </Text>
          <Divider />
        </VStack>
        <Box borderRadius="lg" boxShadow="md" p="4" w="100%" h="auto">
          {reviews.map((review) => (
            <React.Fragment key={review.id}>
              {review.cartItems.map((item, index) => (
                <Box
                  key={index}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  p="4"
                  w="100%"
                  display="flex"
                  alignItems="center"
                >
                  <Image
                    src={item.postImage}
                    alt={item.postTitle}
                    boxSize="200px"
                    objectFit="cover"
                    mr="4"
                  />
                  <VStack align="start" spacing="1" flex="1">
                    <Text fontWeight="bold">{item.postTitle}</Text>
                    <Text className="truncate" textAlign="justify" pr="10">
                      {item.postContent}
                    </Text>
                    <Text fontWeight="bold">Price: {item.price}</Text>
                    <Text fontWeight="bold">Quantity: {item.quantity}</Text>
                    <Text fontWeight="bold">ShippingFee: {item.shippingFee}</Text>
                    <Text fontWeight="bold">totalPrice: {item.totalPrice}</Text>
                    <Text>{item.comment}</Text>
                  </VStack>
                  <StarRating
                    rating={item.rating}
                    onRate={(rating) => handleRate(item.id, rating)}
                    avgRating={avgRating} // Pass the avgRating prop to StarRating
                  />
                </Box>
              ))}
            </React.Fragment>
          ))}
        </Box>
      </VStack>
      </Flex>
    </Box>
  );
};

export default ReviewsPage;
