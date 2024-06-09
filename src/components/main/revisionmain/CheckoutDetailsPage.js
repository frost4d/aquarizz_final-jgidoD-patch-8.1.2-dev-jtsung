import "./CheckoutDetailsPage.css";
import React, { useState, useEffect } from "react";
import {
  VStack,
  Text,
  Input,
  Select,
  Button,
  Box,
  Flex,
} from "@chakra-ui/react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import CartItem from "./CartItem";
import Navigation from "./Navigation";
import { db } from "../../../firebase/firebaseConfig";
import { UserAuth } from "../../context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
const CheckoutDetailsPage = () => {
  const { user, userProfile } = UserAuth();
  const location = useLocation();
  console.log("Location state in CheckoutDetailsPage:", location.state);
  const { cartItems = [], totalPrice: itemsTotalPrice = 0 } =
    location.state || {};
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  // const [shippingFee, setShippingFee] = useState(
  //   calculateShippingFee("Metro Manila", totalWeight)
  // );
  const totalWeight = cartItems.reduce((total, item) => total + item.weight, 0);

  const navigate = useNavigate();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [checkedOutItems, setCheckedOutItems] = useState([]);

  useEffect(() => {
    const location = userProfile.location || "Olongapo";
    const calculatedShippingFee = calculateShippingFee(location, totalWeight);
    setShippingFee(calculatedShippingFee);
  }, [userProfile, totalWeight]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleShippingFeeChange = (e) => {
    setShippingFee(e.target.value);
  };

  const calculateShippingFee = (location, weight) => {
    let shippingFee = 0;

    // Example logic: Calculate shipping fee based on location and weight
    if (location === "Olongapo") {
      if (weight <= 1) {
        shippingFee = 50;
      } else if (weight <= 3) {
        shippingFee = 100;
      } else {
        shippingFee = 150;
      }
    } else {
      if (weight <= 1) {
        shippingFee = 100;
      } else if (weight <= 3) {
        shippingFee = 150;
      } else {
        shippingFee = 200;
      }
    }

    console.log("Calculated shipping fee:", shippingFee); // Add this line to check the calculated shipping fee

    return shippingFee;
  };

  const handleProceedToPayment = async () => {
    const totalPrice = itemsTotalPrice + shippingFee;

    try {
      const docRef = await addDoc(collection(db, "payments"), {
        cartItems,
        totalPrice,
        paymentMethod,
        shippingFee,
        createdAt: serverTimestamp(),
      });
      console.log("Document written with ID: ", docRef.id);

      navigate("/payment", {
        state: { cartItems, totalPrice, paymentMethod, shippingFee },
      });
      localStorage.removeItem("wishlist");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <Box>
      <Navigation />
      <Flex justify="center">
        <VStack spacing="4" p="4">
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Checkout Details
          </Text>
          {cartItems.map((item, index) => (
            <CartItem key={index} item={item} onRemove={() => {}} />
          ))}
          <Text fontWeight="bold">Shipping Fee: P{shippingFee}</Text>
          <Text fontWeight="bold">
            Total Price: P{itemsTotalPrice + shippingFee}
          </Text>
          <Select
            placeholder="Select Payment Method"
            value={paymentMethod}
            onChange={handlePaymentMethodChange}
          >
            <option value="cod">(Cash on Delivery COD)</option>
            <option value="gcash">GCash</option>
            <option value="googlePay">Google Pay</option>
          </Select>
          <Button colorScheme="blue" onClick={handleProceedToPayment}>
            Proceed to Payment
          </Button>
        </VStack>
        <Link
          to="/payment"
          state={{ cartItems, totalPrice: itemsTotalPrice + shippingFee }}
        ></Link>
      </Flex>
    </Box>
  );
};

export default CheckoutDetailsPage;

const calculateShippingFee = (location, weight) => {
  let shippingFee = 0;

  // Example logic: Calculate shipping fee based on location and weight
  if (location === "Metro Manila") {
    if (weight <= 1) {
      shippingFee = 50;
    } else if (weight <= 3) {
      shippingFee = 100;
    } else {
      shippingFee = 150;
    }
  } else {
    if (weight <= 1) {
      shippingFee = 100;
    } else if (weight <= 3) {
      shippingFee = 150;
    } else {
      shippingFee = 200;
    }
  }

  return shippingFee;
};
