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

      <Box p={5}>
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
              We offer a 1-day return policy. You can return any item within 1
              days of purchase for a full refund.
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
      <Footer />
    </Box>
  );
};

export default Faqs;
