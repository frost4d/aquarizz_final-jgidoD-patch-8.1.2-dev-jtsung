import React, { useState } from "react";

import {
  Box,
  Flex,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  Image,
  Card,
  CardHeader,
  CardBody,
  Center,
} from "@chakra-ui/react";
import Footer from "./Footer";
import Navigation from "./Navigation";

const ContactUs = () => {
  const [cartItemCount, setCartItemCount] = useState(0);

  return (
    <Box>
      <Navigation
        cartItemCount={cartItemCount}
        setCartItemCount={setCartItemCount}
      />
      <Box p={5} bg="#f8f9fa">
        <Center>
        <Box w="80%" py="4">
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          top="400px"
          left="100px"
          transform="rotate(15deg)"
        >
          {/* <Image
            h="300px"
            src={require("../../../assets/cartoon fish(1).png")}
          /> */}
        </Box>
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          bottom="250px"
          right="20%"
          transform="translateX(50%)"
        >
          <Image
            h="350px"
            src={require("../../../assets/fish swimming(1).png")}
          />
        </Box>
        <Box justifyContent="center" alignItems="center">
          <Heading mb={5}>Contact Us</Heading>
          <Text mb={10}>
            We’d love to hear from you! Whether you have a question about our
            services, or anything else, our team is ready to answer all your
            questions.
          </Text>
          <Flex flexWrap="wrap" justifyContent="space-between">
            <Box flex="1" mr={5}>
              <Heading size="md" mb={2}>
                DETAILS
              </Heading>
              <Text mb={3}>Gordon College, Olongapo City</Text>
              <Text mb={3}>Phone: (+63) 9054251897</Text>
              <Text mb={3}>Email: aquarizzcustomersupprt@gmail.com</Text>
            </Box>
            <Box flex="1">
              <VStack spacing={4}>
                <FormControl id="name">
                  <FormLabel>Name</FormLabel>
                  <Input type="text" bgColor="#f8f9fa" borderWidth="3px" />
                </FormControl>
                <FormControl id="email">
                  <FormLabel>Email</FormLabel>
                  <Input type="email" bgColor="#f8f9fa" borderWidth="3px" />
                </FormControl>
                <FormControl id="message">
                  <FormLabel>Message</FormLabel>
                  <Textarea bgColor="#f8f9fa" borderWidth="3px" />
                </FormControl>
                <Button colorScheme="blue" type="submit">
                  Send Message
                </Button>
              </VStack>
            </Box>
          </Flex>
        </Box>
      </Box>
      </Center>
      </Box>
      <Footer />
    </Box>
  );
};

export default ContactUs;
