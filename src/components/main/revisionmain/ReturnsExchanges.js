import React, { useState } from 'react';
import { Box, Heading, Text, List, ListItem, ListIcon } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import Footer from './Footer';
import Navigation from './Navigation';
const ReturnsExchanges = () => {
  const [cartItemCount, setCartItemCount] = useState(0);

  return (
    <Box>
      <Navigation
        cartItemCount={cartItemCount}
        setCartItemCount={setCartItemCount}
      />
    <Box p={5}>
      <Heading mb={5}>Returns and Exchanges</Heading>
      <Text mb={3}>
        If you are not completely satisfied with your purchase, we're here to help. Our return and exchange policy allows you to return or exchange items within 30 days of receipt.
      </Text>
      <Heading size="md" mb={2}>Return Policy</Heading>
      <List spacing={3} mb={5}>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          You have 1 days to return an item or fish from the date you received it.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          To be eligible for a return, your item must be unused and in the same condition that you received it.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          Your item must be in the original packaging.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          You need to have the receipt or proof of purchase.
        </ListItem>
      </List>

      <Heading size="md" mb={2}>Exchange Policy</Heading>
      <List spacing={3} mb={5}>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          We only replace items if they are defective or damaged.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          If you need to exchange an item, please contact our customer service team.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          Provide a description of the issue, and any supporting photos if applicable.
        </ListItem>
      </List>

      <Heading size="md" mb={2}>Refunds</Heading>
      <Text mb={3}>
       If you receive a defective or damaged item, please contact us immediately with details and photos of the product and the defect.
    </Text>
      <Text mb={3}>
      We will contact the seller immediately.
      </Text>

      <Heading size="md" mb={2}>Shipping</Heading>
      <Text mb={3}>
        You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
      </Text>
      <Text mb={3}>
        For any further questions, please contact our customer service team at aquarizzcustomersupprt@gmail.com or through our contact us system.
      </Text>
      <Text mb={3}>
      By purchasing from AQUARIZZ, you agree to this Return and Exchange Policy. We appreciate your understanding and support. Thank you for choosing us for your fish-keeping needs!
      </Text>
    </Box>
      <Footer />
      </Box>
  );
};

export default ReturnsExchanges;
