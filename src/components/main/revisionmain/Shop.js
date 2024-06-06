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
import Register from "../../Register";
import { UserAuth } from "../../context/AuthContext";
import { Plus } from "react-feather";
import Create from "./listing/Create";
import { formatDistanceToNow } from "date-fns";
import Footer from "./Footer";
import { useForm } from "react-hook-form";
const Shop = () => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm();
  const { user } = UserAuth();
  const addShop = useDisclosure();
  const toast = useToast();
  const [shopPosts, setShopPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState(""); 
  const primaryColor = "#FFC947";
  const primaryFont = '"Poppins", sans-serif';
  const tertiaryColor = "#6e6e6e";
  const modalShop = useDisclosure();
  const navigate = useNavigate();
  const [filter, setFilter] = useState();
  const [filteredData, setFilteredData] = useState();
  useEffect(() => {
    const fetchShopPosts = async () => {
      const postsCollection = collection(db, "shop");
      const querySnapshot = await getDocs(postsCollection);
      const tempPosts = [];
      querySnapshot.forEach((doc) => {
        tempPosts.push({ id: doc.id, ...doc.data() });
      });
      setShopPosts(tempPosts);
      setFilteredPosts(tempPosts);
    };
    fetchShopPosts();
  }, []);

  useEffect(() => {
    const fetchUserLocation = async () => {
      const usersCollection = collection(db, "users1");
      const querySnapshot = await getDocs(usersCollection);
      querySnapshot.forEach((doc) => {
        if (doc.id === user.uid) {
          setLocation(doc.data().location);
        }
      });
    };
    if (user) {
      fetchUserLocation();
    }
  }, [user]);

  const handleSearchShop = (searchTerm, location) => {
    setSearchTerm(searchTerm);
    const filtered = shopPosts.filter((post) =>
      post.tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
    post.location && post.location.toLowerCase().includes(location.toLowerCase())
    );
    setFilteredPosts(filtered);
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
  const handleFilter = (data) => {
    setFilter(data);
  };

  useEffect(() => {
    const handleFilterData = () => {
      const filteredResults = [];

      shopPosts.forEach((post) => {
        const tag = post.tag.toLowerCase();
        // if (data.accessories) {
        //   filteredResults.filter(post.tag === "accessories").push(post);
        // }
        // if (data.aquarium) {
        //   filteredResults.filter(post.tag === "aquarium").push(post);
        // }
        // if (data.fish) {
        //   filteredResults.filter(post.tag === "fish").push(post);
        // }
        if (filter.aquarium && tag === "aquarium") {
          filteredResults.push(post);
        }
      });
      return setFilteredData(filteredResults);
    };
  }, []);

  console.log(shopPosts.filter((post) => post.tag === "fish"));
  console.log(shopPosts);
  return (
    <>
      <Box h="100vh" overflowY="auto">
        <Navigation />
        <Flex justify="space-between" p="0 64px 0 64px">
          <Heading fontFamily={primaryFont}>Shop</Heading>
          <Flex display={user ? "flex" : "none"} justify="space-between">
            <Button variant="link" color="#333333">
              My Shop
            </Button>
          </Flex>
        </Flex>
        <Box className="shopContentWrapper">
          <Box >
            <SearchInput  handleSearch={handleSearchShop} />
          </Box>
          <Flex
            gap="24px 12px"
            flexWrap="wrap"
            justify="space-evenly"
            align="center"
            my="64px"
          >

            <Flex
              className="shop__contents"
              m="0 64px"
              justify="space-between"
              align="start"
              w="100%"
            >
              <Box
                className="filter__wrapper"
                p="2px 6px"
                border="2px solid #e9e9e9"
                flex="1"
              >
                <Text as="b" size="md">
                  Filter
                </Text>
                <form onSubmit={handleSubmit(handleFilter)}>
                  <Flex flexDirection="column" p="12px">
                    <Checkbox {...register("accessories")}>
                      Accessories
                    </Checkbox>
                    <Checkbox {...register("aquarium")}>Aquarium</Checkbox>
                    <Checkbox {...register("feeds")}>Feeds</Checkbox>
                    <Checkbox {...register("fish")}>Fish</Checkbox>
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
              <Box className="gridItem__wrapper" flex="3">
                {filteredPosts ? (
                  <Grid
                    className="gridItem__holder"
                    templateColumns={`repeat(5, 1fr)`}
                    gap="2"
                    autoRows="minmax(200px, auto)"
                    rowGap={4}
                  >
                    {filteredPosts &&
                      filteredPosts.map((post) => (
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
                            <Box
                              className="itemsWrapper"
                              h="100%"
                              w="100%"
                              onClick={() => {
                                navigate("/AddToCart/" + post.id);
                              }}
                            >
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
              <Box className="filler" flex="1"></Box>
            </Flex>

          </Flex>
        </Box>
      </Box>
      <Footer />
    </>
  );
};
export default Shop;
