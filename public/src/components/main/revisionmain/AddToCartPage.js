import "./AddToCartPage.css";
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
  Avatar
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
  const navigate = useNavigate();
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
          const productData = docSnap.data();
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

        {sellerProfile && (
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
                      <Avatar size="xl" name={sellerProfile.name} src={sellerProfile.avatarUrl || "/path/to/avatar.jpg"} />
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
                <Comments  postID={post.id} authorId={post.authorID} />
              </Box>
            </Box>
          </Center>
        )}
        <Flex w="100%" h="100vh" align="center" justify="center">
            <span className="loader"></span>
          </Flex>
      </Box>
    </>
  );
};

export default AddToCartPage;
