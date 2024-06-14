import React from 'react';
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
  VStack
} from '@chakra-ui/react';

const ContactUs = () => {
  return (
    <Box p={5}>
      <Heading mb={5}>Contact Us</Heading>
      <Text mb={3}>
        We’d love to hear from you! Whether you have a question about our services, or anything else, our team is ready to answer all your questions.
      </Text>
      <Flex flexWrap="wrap" justifyContent="space-between">
        <Box flex="1" mr={5}>
          <Heading size="md" mb={2}>DETAILS</Heading>
          <Text mb={3}>Gordon College, Olongapo City</Text>
          <Text mb={3}>Phone: (***) ***-******</Text>
          <Text mb={3}>Email: aquarizzcustomersupprt@gmail.com</Text>
        </Box>
        <Box flex="1">
          <VStack spacing={4}>
            <FormControl id="name">
              <FormLabel>Name</FormLabel>
              <Input type="text" />
            </FormControl>
            <FormControl id="email">
              <FormLabel>Email</FormLabel>
              <Input type="email" />
            </FormControl>
            <FormControl id="message">
              <FormLabel>Message</FormLabel>
              <Textarea />
            </FormControl>
            <Button colorScheme="blue" type="submit">Send Message</Button>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default ContactUs;
