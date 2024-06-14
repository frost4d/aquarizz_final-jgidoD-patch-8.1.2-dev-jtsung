// StarRating.js

import React, { useState, useEffect } from "react";
import { StarIcon } from "@chakra-ui/icons";
import { Flex, VStack, Text } from "@chakra-ui/react";

const StarRating = ({ rating, onRate, avgRating }) => {
  console.log("avgRating in StarRating:", avgRating); // Log avgRating prop


  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (index) => {
    onRate(index);
  };


  const stars = Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < rating;
    return <StarIcon key={index} color={isFilled ? "yellow.400" : "gray.300"} />;
  });

  const avgStars = Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < (hoverRating || rating);
    return (
      <StarIcon
        key={index}
        color={isFilled ? "yellow.400" : "gray.300"}
        onMouseEnter={() => handleMouseEnter(index + 1)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(index + 1)}
        style={{ cursor: "pointer" }}
      />
    );
  });

  return (
    <VStack>
      {/* <Flex>{stars}</Flex> */}
      {/* <Text>Average Rating:</Text> */}
      <Flex>{avgStars}</Flex>
    </VStack>
  );
};

export default StarRating; // Export the StarRating component as default
