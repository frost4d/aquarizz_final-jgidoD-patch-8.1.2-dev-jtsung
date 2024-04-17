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
import { useParams } from "react-router-dom";

const AddToCartPage = ({ route }) => {
  const { id } = useParams(); // Get the product ID from the URL
  const [cartItems, setCartItems] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const addToCart = (item) => {
    setCartItems([...cartItems, item]);
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
      {product && (
        <Center>
          <Flex p="20" mx="10px">
        {/* <Flex justify="center" align="center" mt="64px"> */}
          <Box flex="1" minWidth="600px">
          <Slider {...settings}>
            <Image
              objectFit="cover"
              src={product.postImage}
              alt="Post Image"
              mb="24px"
            />
             </Slider>
             </Box>
             <Box flex="2" pl="12">
             <VStack align="stretch" spacing="4">
            <Heading fontSize="50px" color="blue.500" fontFamily="Poppins" mb="4">
              {product.postTitle}
            </Heading>
            
            <Text fontSize="28px" fontWeight="bold" mb="4">Product Description</Text>

            <Text color="#6e6e6e" mb="16px">
              {product.postContent}
            </Text>
            <Text as="i" fontSize="sm" color="#6e6e6e" >
              {product.tag}
            </Text>
            <Text fontSize="50px" fontWeight="bold" color="red.500" mb="2">
              Price: P{product.price}
            </Text>

            <HStack spacing="4">
              <Button onClick={() => addToCart('Item 1')} colorScheme="teal">Add to Cart</Button>
              <Button onClick={() => addToCart('Item 1')} colorScheme="blue">Buy Now</Button>
            </HStack>
            {/* <Button bg="#FFC947" w="100%">
              Add to Cart
            </Button> */}
            </VStack>
            <Heading mt="8" size="md">Cart Items</Heading>
          <List>
            {cartItems.map((item, index) => (
              <ListItem key={index}>
                <Text>{item}</Text>
              </ListItem>
            ))}
          </List>
          </Box>
        </Flex>
        </Center>
      )}
    </>
  );
};

export default AddToCartPage;
