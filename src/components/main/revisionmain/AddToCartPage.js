import "./AddToCartPage.css";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc, collection, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import {
  Box,
  Flex,
  Image,
  Heading,
  Text,
  Button,
  Center,
  VStack,
  HStack,
  List,
  ListItem,
  Slider,
  Avatar,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from "@chakra-ui/react";
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
import { useParams, Routes, Route, useNavigate } from "react-router-dom";
import CartItem from "./CartItem";
import CartListPage from "./CartListPage";
import Navigation from "./Navigation";

import Comments from "../mainComponents/Comment";
import { UserAuth } from "../../context/AuthContext";

import Footer from "./Footer";
import GooglePay from "../mainComponents/GooglePay";


const AddToCartPage = ({ route }) => {
  const { id } = useParams(); 
  const { user, userProfile } = UserAuth();
  const [post, setPost] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const toast = useToast();
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const cancelRef = useRef();
  // const [totalPrice, setTotalPrice] = useState(product.price);
  // const addToCart = (item) => {
  //   setCartItems([...cartItems, item]);
  // };
  const onClose = () => setIsAlertOpen(false);

  const addToCart = (item) => { 
    setCartItemCount(cartItemCount + 1);
    const existingItems = JSON.parse(localStorage.getItem("wishlist")) || [];
    // const updatedItems = [...existingItems, item];
    const updatedItems = [...existingItems, { ...item, quantity }];
    localStorage.setItem("wishlist", JSON.stringify(updatedItems));
    setCartItems(updatedItems);
  };

  const handleQuantityChange = (value) => {
    // const quantityValue = parseInt(value);
    if (parseInt(value) <= product.totalAvailable) {
      setQuantity(parseInt(value));
      // setTotalPrice(product.price * parseInt(value));
    } else {
      toast({
        title: "Error",
        description: "Quantity exceeds available stock.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (quantity > product.totalAvailable) {
      toast({
        title: "Error",
        description: "Quantity exceeds available stock.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const cartItem = {
      ...product,
      quantity,
      userId: user.uid,
    };

    addToCart(cartItem);
    setIsAlertOpen(true);
    toast({
      title: "Added to Cart",
      description: "Product has been added to your cart.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  
  const fetchSellerProfile = async (authorID) => {
    try {
      console.log("Fetching seller profile with authorID:", authorID);
      const sellerDocRef = doc(db, "users1", authorID);
      const sellerDocSnap = await getDoc(sellerDocRef);
      if (sellerDocSnap.exists()) {
        setSellerProfile(sellerDocSnap.data());
      } else {
        setError(`No such seller with ID: ${authorID}`);
        console.error(`No such seller with ID: ${authorID}`);
      }
    } catch (error) {
      setError("Error fetching seller profile: " + error.message);
      console.error("Error fetching seller profile:", error.message);
    }
  };


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log("Fetching product with ID:", id);
        const docRef = doc(db, "shop", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // const productData = docSnap.data();
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          fetchSellerProfile(productData.authorID);
        } else {
          setError("No such document!");
          console.error("No such document!");
        }
      } catch (error) {
        setError("Error fetching product: " + error.message);
        console.error("Error fetching product:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const existingItems = JSON.parse(localStorage.getItem("wishlist")) || [];
    setCartItems(existingItems);
  }, []);

  const addComment = async (postId, comment) => {
    try {
      const commentRef = collection(db, "shop", postId, "comments");
      await addDoc(commentRef, {
        comment,
        createdAt: serverTimestamp(),
        author: user.displayName,
      });
      console.log("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment: ", error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (current) => setCurrentSlide(current),
  };

  return (
    <>
      <Box h="100vh">
        <Navigation />

        {sellerProfile && product && (
          <Center>
            <Box>
              <Flex p="10" mx="50px" bg="#f8f9fa">
                {/* <Flex justify="center" align="center" mt="64px"> */}
                <Box flex="1" minWidth="600px">
                  <Slider {...settings}>
                    <Image
                      objectFit="cover"
                      src={product.postImage}
                      alt="Post Image"
                      mb="24px"
                    />
                    <Box display="flex" justifyContent="space-between">
                      <Image
                        objectFit="cover"
                        src={product.postImage}
                        alt="Image 1"
                        w="32%"
                        h="auto"
                      />
                      <Image
                        objectFit="cover"
                        src={product.postImage}
                        alt="Image 2"
                        w="32%"
                        h="auto"
                      />
                      <Image
                        objectFit="cover"
                        src={product.postImage}
                        alt="Image 3"
                        w="32%"
                        h="auto"
                      />
                    </Box>
                  </Slider>
                </Box>
                <Box flex="2" pl="12">
                  <VStack align="stretch" spacing="4">
                    <Heading
                      fontSize="50px"
                      color="blue.500"
                      fontFamily="Poppins"
                      mb="2"
                    >
                      {product.postTitle}
                    </Heading>

                    <Text fontSize="28px" fontWeight="bold" mb="4">
                      Product Description
                    </Text>

                    <Text
                      color="#6e6e6e"
                      mb="16px"
                      bg="#e9ecef"
                      w="100%"
                      h="auto"
                      p="3"
                    >
                      {product.postContent}
                    </Text>
                    <Text as="i" fontSize="sm" color="#6e6e6e">
                      {product.tag}
                    </Text>
                    <Text
                      fontSize="50px"
                      fontWeight="bold"
                      color="red.500"
                      mb="2"
                    >
                      Price: P{product.price}
                    </Text>

                    <Text fontSize="20px" mb="4">
                      Total Available: {product.totalAvailable}
                    </Text>

                    <HStack spacing="4" alignItems="center">
                      <Text fontSize="20px">Quantity:</Text>
                      <NumberInput
                        value={quantity}
                        min={1}
                        max={product.totalAvailable}
                        // onChange={(valueString) => setQuantity(parseInt(valueString))}
                        onChange={handleQuantityChange}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </HStack>

                    <HStack spacing="4">
                      <Button
                        variant="link"
                        onClick={handleAddToCart}
                        color="#161616"
                      >
                        Add to Wishlist
                      </Button>
                      <GooglePay price={product.price}/>
                      {/* <Button
                        onClick={() => {addToCard(product)}}
                        colorScheme="blue"
                      >
                        Buy Now
                      </Button> */}
                    </HStack>
                  </VStack>
                  
                  {/* <CartListPage cartItems={cartItems} setCartItems={setCartItems} /> */}
                </Box>
              </Flex>

              <Flex p="10" mx="50px" bg="#f8f9fa" mt="10">
                <Box flex="1">
                  <VStack align="stretch" spacing="4">
                    <Heading
                      fontSize="40px"
                      color="blue.500"
                      fontFamily="Poppins"
                      mb="2"
                    >
                      Seller Profile
                    </Heading>
                    <HStack spacing="4">
                      <Avatar size="xl" name={sellerProfile.name} src={sellerProfile.profileImage || "/path/to/avatar.jpg"} />
                      <VStack align="stretch">
                        <Text fontSize="20px" fontWeight="bold">
                        {sellerProfile.name}
                        </Text>
                        <Text fontSize="16px" color="#6e6e6e">
                        {sellerProfile.email}
                        </Text>
                        <Button colorScheme="blue" onClick={() => {
                    navigate(`/profile/${product.authorID}`);
                  }}>
                          Visit Profile
                        </Button>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>
              </Flex>

              <Box p="10" mx="50px" bg="#f8f9fa" mt="10">
                <Text fontSize="20px" fontWeight="bold" mb="20px">Customer Reviews</Text>
                {/* <Comments postID={post.id} authorId={post.authorID} /> */}
                <Comments id={id} authorId={product.authorID} />
              </Box>
            </Box>
          </Center>
        )}
        <Flex w="100%" h="100vh" align="center" justify="center">
            <span className="loader"></span>
          </Flex>
      <Footer />

      </Box>

      
    </>
  );
};

export default AddToCartPage;
