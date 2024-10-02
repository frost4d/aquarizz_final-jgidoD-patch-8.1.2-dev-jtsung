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
  useToast,
} from "@chakra-ui/react";
import Footer from "./Footer";
import Navigation from "./Navigation";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";

const ContactUs = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [cartItemCount, setCartItemCount] = useState(0);
  const handleSendFeedback = (data) => {
    setIsLoading(true);
    console.log("clicked");
    console.log(data);
    try {
      setIsLoading(true);
      emailjs.send(
        "service_mr8iwrn",
        "template_s82d8as",
        data,
        "NPe_0DyLrlq0ymvL9"
      );
      toast({
        description: "sent",
        status: "success",
        duration: 1500,
        position: "top",
      });
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
      reset();
    }
  };
  return (
    <>
      <Box h="100vh">
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
                  We’d love to hear from you! Whether you have a question about
                  our services, or anything else, our team is ready to answer
                  all your questions.
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
                    <form onSubmit={handleSubmit(handleSendFeedback)}>
                      <FormControl id="name">
                        <FormLabel>Name</FormLabel>
                        <Input
                          type="text"
                          bgColor="#f8f9fa"
                          borderWidth="3px"
                          {...register("name", {
                            required: true,
                          })}
                        />
                        {errors.name?.type === "required" && (
                          <p style={{ color: "#d9534f", fontSize: "12px" }}>
                            Email is required
                          </p>
                        )}
                      </FormControl>
                      <FormControl id="email">
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          bgColor="#f8f9fa"
                          borderWidth="3px"
                          {...register("user_email", {
                            required: true,
                          })}
                        />
                        {errors.user_email?.type === "required" && (
                          <p style={{ color: "#d9534f", fontSize: "12px" }}>
                            Name is required
                          </p>
                        )}
                      </FormControl>
                      <FormControl id="message">
                        <FormLabel>Message</FormLabel>
                        <Textarea
                          bgColor="#f8f9fa"
                          borderWidth="3px"
                          {...register("subject", {
                            required: true,
                          })}
                        />
                        {errors.subject?.type === "required" && (
                          <p style={{ color: "#d9534f", fontSize: "12px" }}>
                            Subject is required
                          </p>
                        )}
                      </FormControl>
                      <Box m="12px 0">
                        <Button
                          isLoading={isLoading}
                          colorScheme="blue"
                          type="submit"
                        >
                          Send Message
                        </Button>
                      </Box>
                    </form>
                  </Box>
                </Flex>
              </Box>
            </Box>
          </Center>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default ContactUs;
