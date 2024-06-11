// Sidebar.js
import React from "react";
import { Box, VStack, Text, Center } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";

const Sidebar = () => {
    const navigate = useNavigate();
    const { user } = UserAuth();

    const handleManageClick = () => {
        // Handle the click event here, e.g., navigate to the reviews page
        navigate(`/profile/${user.uid}`);

      };
    const handleOrdersClick = () => {
        // Handle the click event here, e.g., navigate to the reviews page
        navigate("/ItemStatusPage");

      };
    const handleReviewsClick = () => {
        // Handle the click event here, e.g., navigate to the reviews page
        navigate("/reviews");

      };

  return (
    <Box
      w="20%"
      h="28vh"
      // borderWidth="2px"
      // borderColor="red"
      py="8"
      mt="4"
      ml="4"
      boxShadow="md"
    >
      <Center>
        <VStack align="stretch" spacing="6">
        <Text
            fontWeight="bold"
            cursor="pointer"
            onClick={handleManageClick}
          >
            Manage Account</Text>
          <Text
            fontWeight="bold"
            cursor="pointer"
            onClick={handleOrdersClick}
          >
            Orders</Text>
          <Text
            fontWeight="bold"
            cursor="pointer"
            onClick={handleReviewsClick}
          >
            Reviews
          </Text>
        </VStack>
      </Center>
    </Box>
  );
};

export default Sidebar;
