import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
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
} from "@chakra-ui/react";
// import Slider from 'react-slick';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
import { useParams, Routes, Route } from "react-router-dom";
import CartItem from "./CartItem";
import CartListPage from "./CartListPage";
import Navigation from "./Navigation";
import Footer from "./Footer";

const AddToCartPage = ({ route }) => {
  const { id } = useParams(); // Get the product ID from the URL
  const [cartItems, setCartItems] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  // const addToCart = (item) => {
  //   setCartItems([...cartItems, item]);
  // };

  const addToCart = (item) => {
    setCartItemCount(cartItemCount + 1);
    const existingItems = JSON.parse(localStorage.getItem("wishlist")) || [];
    const updatedItems = [...existingItems, item];
    localStorage.setItem("wishlist", JSON.stringify(updatedItems));
    setCartItems(updatedItems);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log("Fetching product with ID:", id);
        const docRef = doc(db, "shop", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          setError("No such document!");
        }
      } catch (error) {
        setError("Error fetching product: " + error.message);
        // }
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
      <Box>
        <Navigation />

        {product && (
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

                    <HStack spacing="4">
                      <Button
                        onClick={() => addToCart(product)}
                        colorScheme="teal"
                      >
                        Add to Wishlist
                      </Button>
                      <Button
                        onClick={() => addToCart(product)}
                        colorScheme="blue"
                      >
                        Buy Now
                      </Button>
                    </HStack>
                  </VStack>
                  {/* <CartListPage cartItems={cartItems} setCartItems={setCartItems} /> */}
                </Box>
              </Flex>
            </Box>
          </Center>
        )}
      </Box>
      <Footer />
    </>
  );
};

export default AddToCartPage;
