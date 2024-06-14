import "./CheckoutDetailsPage.css";
import React, { useState, useEffect } from "react";
import { VStack, Text, Input, Select, Button, Box, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import CartItem from "./CartItem";
import Navigation from "./Navigation";
import { db } from "../../../firebase/firebaseConfig";
import { UserAuth } from "../../context/AuthContext";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import GooglePay from "../mainComponents/GooglePay";
import GCashPayment from "../mainComponents/GcashPayment";

const CheckoutDetailsPage = () => {
  const { id } = useParams(); 
  const { user, userProfile } = UserAuth();
  const location = useLocation();
  console.log("Location state in CheckoutDetailsPage:", location.state);
  const { cartItems = [], totalPrice: itemsTotalPrice = 0 } =
    location.state || {};
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [isGooglePaySelected, setIsGooglePaySelected] = useState(false);
  const [isGCashSelected, setIsGCashSelected] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const [shippingFee, setShippingFee] = useState(
  //   calculateShippingFee("Metro Manila", totalWeight)
  // );
  const totalWeight = cartItems.reduce((total, item) => total + item.weight, 0);

  const navigate = useNavigate();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [checkedOutItems, setCheckedOutItems] = useState([]);

  // const cartItemsWithIds = cartItems.map((item, index) => ({
  //   ...item,
  //   id: index.toString(), // You can replace this with the actual unique identifier for your items
  // }));

  useEffect(() => {
    const location = userProfile.location || "Olongapo";
    const calculatedShippingFee = calculateShippingFee(location, totalWeight);
    setShippingFee(calculatedShippingFee);
  }, [userProfile, totalWeight]);

  const handlePaymentMethodChange = (e) => {
    const selectedPaymentMethod = e.target.value;
    setPaymentMethod(selectedPaymentMethod);
    setIsGooglePaySelected(selectedPaymentMethod === "googlePay");
    setIsGCashSelected(selectedPaymentMethod === "gcash");
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
  // const totalPrice = itemsTotalPrice + shippingFee;
  // const totalPrice = (itemsTotalPrice + shippingFee).toString(); 
  const feePercentage = 0.02; // 2% fee
  const fee = (itemsTotalPrice + shippingFee) * feePercentage;
  const totalPriceWithFee = (itemsTotalPrice + shippingFee + fee).toFixed(2); 



  try {

    const docRef = await addDoc(collection(db, "payments"), {
      cartItems,
      totalPrice: totalPriceWithFee,
      paymentMethod,
      shippingFee,
      createdAt: serverTimestamp()
    });
    console.log("Document written with ID: ", docRef.id);

    for (const item of cartItems) { // Use cartItemsWithIds instead of cartItems
      console.log("Item ID:", item.id); // Log the item ID
      
      const itemRef = doc(db, "shop", item.id); // Assuming 'shop' is your Firestore collection name
      console.log("Item Reference:", itemRef.path); // Log the document path
      
      const itemDoc = await getDoc(itemRef);
      
      if (!itemDoc.exists()) {
        console.error(`Document does not exist for item ID ${item.id}`);
        continue; // Skip this item and proceed to the next one
      }

      const productData = { id: itemDoc.id, ...itemDoc.data() };

      const totalAvailable = productData?.totalAvailable || 0;
      await updateDoc(itemRef, {
        totalAvailable: totalAvailable - item.quantity,
      });
    }

    if (isGCashSelected) {
      onOpen();
      return; 
    }
    
    navigate("/payment", {
      state: { cartItems, totalPrice: totalPriceWithFee, paymentMethod, shippingFee, paymentUrl },
    });
    localStorage.removeItem("wishlist");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};


const fee = (itemsTotalPrice + shippingFee) * 0.02;
  const totalPriceWithFee = (itemsTotalPrice + shippingFee + fee).toFixed(2);

  return (
    <Box>
      <Navigation />
      <VStack align="stretch" spacing="4" p="4">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Checkout Details
        </Text>
        {cartItems.map((item, index) => (
          <CartItem key={index} item={item} onRemove={() => {}} />
        ))}
        <Text fontWeight="bold">Shipping Fee: P{shippingFee}</Text>
        <Text fontWeight="bold">Total Price: P{itemsTotalPrice + shippingFee}</Text>
        <Select
          placeholder="Select Payment Method"
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        >
          <option value="cod">(Cash on Delivery COD)</option>
          <option value="gcash">GCash</option>
          <option value="googlePay">Google Pay</option>
        </Select>
        {/* {isGooglePaySelected && <GooglePay price={(itemsTotalPrice + shippingFee).toString()} />} */}
        {isGooglePaySelected && (
        <Box>
            <GooglePay price={totalPriceWithFee.toString()} />
            <Text fontWeight="bold">2% Fee Charge: P{((itemsTotalPrice + shippingFee) * 0.02).toFixed(2)}</Text>
          </Box>
        )}
       {/* {isGCashSelected && (
          <GCashPayment 
            price={(itemsTotalPrice + shippingFee).toFixed(2)} 
            onPaymentUrlReceived={(url) => setPaymentUrl(url)} // Add this line to set the payment URL
          />
        )} */}
        <Button colorScheme="blue" onClick={handleProceedToPayment}>
          Proceed to Payment
        </Button>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>GCash Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isGCashSelected && (
              <GCashPayment 
                price={(itemsTotalPrice + shippingFee).toFixed(2)} 
                onPaymentUrlReceived={(url) => setPaymentUrl(url)} 
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => {
              onClose();
              navigate("/payment", {
                state: { cartItems, totalPrice: itemsTotalPrice + shippingFee, paymentMethod, shippingFee, paymentUrl },
              });
              localStorage.removeItem("wishlist");
            }}>
              Confirm Payment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Link to="/payment" state={{ cartItems, totalPrice: itemsTotalPrice + shippingFee }}>
      </Link>
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
