import React, { useState } from 'react';
import { Button, Box, Text } from '@chakra-ui/react';
import axios from 'axios';

const GCashPayment = ({ price, onPaymentUrlReceived }) => {
  const [paymentUrl, setPaymentUrl] = useState(null);

  const initiateGCashPayment = async () => {
    try {
      const response = await axios.post(
        'https://api.paymongo.com/v1/sources',
        {
          data: {
            attributes: {
              amount: parseFloat(price) * 100, // Amount in centavos
              redirect: {
                success: 'http://localhost:3000/payment-success',
                failed: 'http://localhost:3000/payment-failure',
              },
              type: 'gcash',
              currency: 'PHP',
            },
          },
        },
        {
          headers: {
            Authorization: `Basic ${btoa('sk_test_Xyt9bzECbWfrttDC7zLkHquw')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const url = response.data.data.attributes.redirect.checkout_url;
      setPaymentUrl(url);
      onPaymentUrlReceived(url);
    } catch (error) {
      console.error('Error initiating GCash payment:', error);
    }
  };

  return (
    <Box>
      <Button
        colorScheme="blue"
        onClick={initiateGCashPayment}
        // borderRadius="full"
        // bg="green.400"
        // _hover={{ bg: 'green.500' }}
        // _active={{ bg: 'green.600' }}
        // _focus={{ outline: 'none' }}
      >
        <Text fontWeight="bold" fontSize="lg">
          Pay with GCash
        </Text>
      </Button>
      {paymentUrl && window.open(paymentUrl, "_blank")}
    </Box>
  );
};

export default GCashPayment;
