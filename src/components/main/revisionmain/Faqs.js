import React, { useState } from "react";
import {
  Box,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  Center,
} from "@chakra-ui/react";
import Footer from "./Footer";
import Navigation from "./Navigation";

const Faqs = () => {
  const [cartItemCount, setCartItemCount] = useState(0);

  return (
    <Box>
      <Navigation
        cartItemCount={cartItemCount}
        setCartItemCount={setCartItemCount}
      />

      <Box p={5} bg="#f8f9fa">
        <Center>
          <Box w="80%" py="10" h="59vh" mb="1">
        <Heading mb={5}>FAQs</Heading>
        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                What is your return policy?
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              We offer a 3-days return policy. You can return any item the
              day you received the product for a full refund.
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                How do I track my order?
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>On the shop status.</AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Do you offer international shipping?
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>Nope.</AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Can I change or cancel my order?
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              You can change or cancel your order within 24 hours of placing it.
              Please contact our support team as soon as possible to make
              changes.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        </Box>
        </Center>
      </Box>
      <Footer />
    </Box>
  );
};

export default Faqs;
