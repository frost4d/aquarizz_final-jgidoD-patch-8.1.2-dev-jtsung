// StarRating.js

import React, { useState, useEffect } from "react";
import { StarIcon } from "@chakra-ui/icons";
import { Flex, VStack, Text } from "@chakra-ui/react";

const StarRating = ({ rating, onRate, avgRating }) => {
  console.log("avgRating in StarRating:", avgRating); // Log avgRating prop

  const stars = Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < rating;
    return <StarIcon key={index} color={isFilled ? "yellow.400" : "gray.300"} />;
  });

  const avgStars = Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < avgRating;
    return <StarIcon key={index} color={isFilled ? "yellow.400" : "gray.300"} />;
  });

  return (
    <VStack>
      {/* <Flex>{stars}</Flex> */}
      <Text>Average Rating:</Text>
      <Flex>{avgStars}</Flex>
    </VStack>
  );
};

export default StarRating; // Export the StarRating component as default
