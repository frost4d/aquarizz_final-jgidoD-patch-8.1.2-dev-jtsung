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
  AlertDialogOverlay,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
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
import { Link } from "react-router-dom";
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


  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };


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


  const proceedToCheckout = () => {
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

    // navigate("/checkout", { state: { cartItems, totalPrice: getTotalPrice() } });
    navigate("/checkout", { state: { cartItems: [cartItem], totalPrice: cartItem.price * quantity } });
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

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>Error: {error}</p>;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (current) => setCurrentSlide(current),
  };
  console.log(sellerProfile);
  console.log("here");
  return (

      <Box h="100vh">
        <Navigation />


        {sellerProfile && product && (
          <>
            <Box mx="12px ">
              <Breadcrumb>
                <BreadcrumbItem>
                  <BreadcrumbLink as={Link} to="/shop">
                    Shop
                  </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbItem>
                  <BreadcrumbLink as="b">{product.postTitle}</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </Box>
            <Box className="itemContents__wrapper">
              <Flex
                flexWrap="wrap"
                className="itemholder"
                justify="center"
                p="10"
                bg="#f8f9fa"
              >

                {/* <Flex justify="center" align="center" mt="64px"> */}
                <Center maxWidth="400px" minW="300px">
                  <Slider {...settings}>
                    <Image
                      objectFit="cover"
                      src={product.postImage}
                      alt="Post Image"
                      mb="24px"
                    />
                    <Box p="4px" display="flex" justifyContent="space-between">
                      <Image
                        border="1px solid #e1e1e1"
                        objectFit="cover"
                        src={product.postImage}
                        alt="Image 1"
                        w="32%"
                        h="auto"
                      />
                      <Image
                        border="1px solid #e1e1e1"
                        objectFit="cover"
                        src={product.postImage}
                        alt="Image 2"
                        w="32%"
                        h="auto"
                      />
                      <Image
                        border="1px solid #e1e1e1"
                        objectFit="cover"
                        src={product.postImage}
                        alt="Image 3"
                        w="100px"
                        h="auto"
                      />
                    </Box>
                  </Slider>
                </Center>
                <Box w="600px" maxW="600px" minW="300px">
                  <Box spacing="4">
                    <Text
                      fontWeight="600"
                      color="#000"
                      fontFamily="Poppins"
                      mb="2"
                      fontSize="xl"
                    >
                      {product.postTitle}
                    </Text>

                    <Text
                      fontSize="3xl"
                      fontWeight="700"
                      color="red.500"
                      mb="2"
                    >
                      &#8369; {product.price}
                    </Text>


                    <Text fontSize="md" mb="4">
                      Total Available:{" "}
                      {!product.totalAvailable ? (
                        <Text color="gray.500">N/A</Text>
                      ) : (
                        product.totalAvailable
                      )}
                    </Text>

                    <HStack spacing="4" alignItems="center">
                      <Text fontSize="md">Quantity:</Text>

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


                    <Flex flexWrap="wrap" className="transactionBtn__wrapper">

                    <HStack spacing="4">

                      <Button
                        variant="link"
                        onClick={handleAddToCart}
                        color="#161616"
                      >
                        Add to Wishlist
                      </Button>

                      {/* <GooglePay price={product.price}/> */}
                      <Button
                        onClick={proceedToCheckout}

                        colorScheme="blue"
                        >
                        Buy Now

                      </Button>
                    </HStack>
                    </Flex>
                  </Box>
                  

                  {/* <CartListPage cartItems={cartItems} setCartItems={setCartItems} /> */}
                </Box>
              </Flex>
              <Flex p="12px" mx="auto" bg="#f8f9fa">
                <Box flex="1">
                  <VStack align="stretch" spacing="4">
                    {/* <Heading
                    fontSize="40px"
                    color="blue.500"
                    fontFamily="Poppins"
                    mb="2"
                    >

                    Seller Profile
                    </Heading> */}
                    <Flex gap="4">
                      <Avatar
                        size="lg"
                        name={sellerProfile.name}
                        src={sellerProfile.profileImage || "/path/to/avatar.jpg"}
                      />
                      <Box>
                        <Text
                          variant="link"
                          color="#000"
                          fontSize="20px"
                          fontWeight="bold"
                        >
                          {sellerProfile.name}

                        </Text>
                        <Text fontSize="16px" color="#6e6e6e">
                          {sellerProfile.email}
                        </Text>
                        <Button
                          variant="outline"
                          colorScheme="blue"
                          _hover={{ bg: "#2B6CB0", color: "#fff" }}
                          onClick={() => {
                            navigate(`/profile/${product.authorID}`);
                          }}
                        >
                          Visit Profile
                        </Button>
                      </Box>
                    </Flex>
                  </VStack>
                </Box>
              </Flex>
              <Box className="item__productDescription">
                <Text fontSize="xl" fontWeight="bold">
                  Product Description
                </Text>

                <Text
                  color="#6e6e6e"
                  mb="16px"
                  bg="#EDF0F2"
                  w="100%"
                  h="auto"
                  p="3"
                  borderRadius="4px"
                >
                  {product.postContent}
                </Text>
                <Heading size="sm">Tags</Heading>
                <Text as="i" fontSize="sm" color="#6e6e6e">
                  #{product.tag}
                </Text>
              </Box>

              <Box p="10" mx="max(auto, 32px)" bg="#f8f9fa" mt="10">
                <Text fontSize="20px" fontWeight="bold" mb="20px">
                  Reviews
                </Text>
                {/* <Comments postID={post.id} authorId={post.authorID} /> */}
                <Comments id={id} authorId={product.authorID} />
              </Box>
            </Box>
          </>
        )}
      <Footer />
      </Box>
  );
};

export default AddToCartPage;
