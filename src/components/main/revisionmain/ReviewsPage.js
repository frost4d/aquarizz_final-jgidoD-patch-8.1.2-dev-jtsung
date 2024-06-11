import React, { useState, useEffect } from "react";
import { VStack, Text, Divider, Box, Image } from "@chakra-ui/react";
import Navigation from "./Navigation";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import StarRating from "./StarRating"; // Import the StarRating component

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

  return (
    <Box>
      <Navigation />
      <VStack align="stretch" spacing="4" p="4">
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
                    avgRating={avgRating} // Pass the avgRating prop to StarRating
                  />
                </Box>
              ))}
            </React.Fragment>
          ))}
        </Box>
      </VStack>
    </Box>
  );
};

export default ReviewsPage;
