import "./Shop.css";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import {
  Box,
  Heading,
  Flex,
  Button,
  Text,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
  useDisclosure,
  Modal,
  ModalContent,
  ModalBody,
  ModalOverlay,
  useToast,
  InputGroup,
  Checkbox,
  GridItem,
  Grid,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import AddToCartPage from "./AddToCartPage";
import Navigation from "./Navigation";
import SearchInput from "./components/SearchInput";
import { UserAuth } from "../../context/AuthContext";
import { Plus } from "react-feather";
import Create from "./listing/Create";
import { formatDistanceToNow } from "date-fns";
import Footer from "./Footer";
const Shop = () => {
  const { user } = UserAuth();
  const addShop = useDisclosure();
  const toast = useToast();
  const [shopPosts, setShopPosts] = useState([]);
  const primaryColor = "#FFC947";
  const primaryFont = '"Poppins", sans-serif';
  const tertiaryColor = "#6e6e6e";
  const modalShop = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShopPosts = async () => {
      const postsCollection = collection(db, "shop");
      const querySnapshot = await getDocs(postsCollection);
      const tempPosts = [];
      querySnapshot.forEach((doc) => {
        tempPosts.push({ id: doc.id, ...doc.data() });
      });
      setShopPosts(tempPosts);
    };
    fetchShopPosts();
  }, []);

  const handleSearchShop = (data) => {
    console.log(data);
  };

  const handleAddShop = (formData) => {
    // Add logic to save the form data to your database or state
    console.log(formData);
    const docRef = addDoc(collection(db, "shop"), formData);
    // For example, you can update the discoverPosts state with the new data
    setShopPosts([...shopPosts, formData]);
    addShop.onClose(); // Close the modal after submitting
    toast({
      title: "Post Created.",
      description: "Post successfully published.",
      status: "success",
      duration: 5000,
      position: "top",
    });
  };

  console.log(shopPosts);
  return (
    <>
      <Box h="100vh" overflowY="auto">
        <Navigation />
        <Flex justify="space-between" p="0 64px 0 64px">
          <Heading fontFamily={primaryFont}>Shop</Heading>
          <Flex display={user ? "flex" : "none"} justify="space-between">
            {/* <Button
              textAlign="center"
              variant="link"
              color="#333333"
              mr="12px"
              leftIcon={<Plus size={16} />}
              onClick={modalShop.onOpen}
            >
              <Create isOpen={modalShop.isOpen} onClose={modalShop.onClose} />
              Create
            </Button> */}
            {/* <Modal>
              <ModalOverlay />
              <ModalContent>
                <ModalBody>Link to create listing</ModalBody>
              </ModalContent>
            </Modal> */}
            <Button variant="link" color="#333333">
              My Shop
            </Button>
          </Flex>
        </Flex>
        <Box className="shopContentWrapper">
          <Box>
            <SearchInput />
          </Box>
          <Flex
            gap="24px 12px"
            flexWrap="wrap"
            justify="space-evenly"
            align="center"
            my="64px"
          >
            {/* {shopPosts &&
              shopPosts.map((post) => (
                <>
                  <Card
                    key={post.id}
                    border="1px solid #e1e1e1"
                    w="700px"
                    h="360px"
                  >
                    <CardHeader>
                      <Flex justify="space-between">
                        <Button variant="link" color="#333333">
                          {post.authorName}
                        </Button>
                        <Text fontSize="xs" color={tertiaryColor} as="i">
                          {formatDistanceToNow(post.createdAt)} ago
                        </Text>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <Flex className="cardContent">
                        <Box w="100%" className="imageWrapper">
                          <Image
                            objectFit="cover"
                            w="300px"
                            h="200px"
                            src={post.postImage}
                            alt="Post Image"
                          />
                        </Box>
                        <Box className="descriptionWrapper">
                          <Flex justify="space-between">
                            <Heading fontFamily={primaryFont}>
                              {post.postTitle}
                            </Heading>
                            <Text as="b">P{post.price}</Text>
                          </Flex>
                          <Text fontSize="xs" as="i" color={tertiaryColor}>
                            {post.tag}
                          </Text>

                          <Text fontSize="sm" color={tertiaryColor}>
                            {post.postContent}
                          </Text>
                        </Box>
                      </Flex>
                    </CardBody>
                    <Box m="0 16px 32px 24px">
                      <Button
                        bg={primaryColor}
                        w="100%"
                        onClick={() => {
                          navigate("/AddToCart/" + post.id);
                        }}
                      >
                        View Product
                      </Button>
                    </Box>
                  </Card>
                </>
              ))} */}

            <Flex
              className="shop__contents"
              m="0 64px"
              justify="space-between"
              align="start"
              w="100%"
            >
              <Box p="2px 6px" border="2px solid #e9e9e9" flex="1">
                <Text as="b" size="md">
                  Filter
                </Text>
                <form>
                  <Flex flexDirection="column" p="12px">
                    <Checkbox defaultChecked>All</Checkbox>
                    <Checkbox>Accessories</Checkbox>
                    <Checkbox>Aquarium</Checkbox>
                    <Checkbox>Feeds</Checkbox>
                    <Checkbox>Fish</Checkbox>
                    <Button
                      mt="12px"
                      variant="outline"
                      bg="#7E8EF1"
                      type="submit"
                      color="#fff"
                    >
                      Apply
                    </Button>
                  </Flex>
                </form>
              </Box>
              <Box flex="3">
                {shopPosts ? (
                  <Grid
                    templateColumns={`repeat(5, 1fr)`}
                    gap="2"
                    autoRows="minmax(200px, auto)"
                    rowGap={4}
                  >
                    {shopPosts &&
                      shopPosts.map((post) => (
                        <GridItem
                          className="gridItem"
                          p="6px"
                          key={post.id}
                          colSpan={1}
                          rowSpan={1}
                          _hover={{
                            boxShadow: "0 3px 2px #e9e9e9",
                            transform: "translateY(-3px)",
                          }}
                          onClick={() => {
                            console.log(post.id);
                          }}
                        >
                          <Box className="itemsWrapper" h="100%" w="100%">
                            <Image
                              borderRadius="2px"
                              h="200px"
                              w="100%"
                              src={post.postImage}
                              objectFit="cover"
                            />
                            <Box className="descriptionWrapper">
                              <Text fontSize="sm" p="3px 6px">
                                {post.postTitle}
                              </Text>
                              <Heading size="sm">&#8369;{post.price}</Heading>
                              <Text fontSize="xs" as="i">
                                {post.tag}
                              </Text>
                            </Box>
                          </Box>
                        </GridItem>
                      ))}
                  </Grid>
                ) : (
                  <Text>Feels empty here...</Text>
                )}
              </Box>
              <Box flex="1"></Box>
            </Flex>
          </Flex>
        </Box>
      </Box>
      <Footer />
    </>
  );
};
export default Shop;
