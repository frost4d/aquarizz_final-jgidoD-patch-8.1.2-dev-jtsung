import "./LandingPageMarket.css";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import {
  Box,
  Flex,
  Image,
  Text,
  Heading,
  Input,
  Button,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
  ModalContent,
  ModalHeader,
  FormLabel,
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuGroup,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  background,
  Avatar,
} from "@chakra-ui/react";
import {
  User,
  Edit,
  Compass,
  ShoppingBag,
  ArrowRight,
  Facebook,
  Mail,
  Twitter,
} from "react-feather";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import LoginModal from "./LoginModal";
import { UserAuth } from "../../context/AuthContext";
import Navigation from "./Navigation";
import SearchInput from "./components/SearchInput";
import { ChevronDownIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import Footer from "./Footer";
import Contact from "../../Contact";

const LandingPageMarket = () => {
  const loginModal = useDisclosure();
  const primaryColor = "#FFC947";
  const primaryFont = '"Poppins", sans-serif';
  const secondaryFont = '"Montserrat", sans-serif';
  const navigate = useNavigate();
  const [isUser, setIsUser] = useState(false);
  const { user, userProfile } = UserAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shopPosts, setShopPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const modalShop = useDisclosure();
  // const letter = user.name.charAt(0);
  // const [windowSize, setWindowSize] = useState();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

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
    if (user) {
      const fetchUserLocation = async () => {
        const usersCollection = collection(db, "users1");
        const querySnapshot = await getDocs(usersCollection);
        querySnapshot.forEach((doc) => {
          if (doc.id === user.uid) {
            setLocation(doc.data().location);
          }
        });
      };
      fetchUserLocation();
    }
  }, [user]);
  // useEffect(() => {
  //   const fetchUserLocation = async () => {
  //     const usersCollection = collection(db, "users1");
  //     const querySnapshot = await getDocs(usersCollection);
  //     querySnapshot.forEach((doc) => {
  //       if (doc.id === user.uid) {
  //         setLocation(doc.data().location);
  //       }
  //     });
  //   };
  //   if (user) {
  //     fetchUserLocation();
  //   }
  // }, [user]);

  const handleSearchShop = (searchTerm, userLocation) => {
    setSearchTerm(searchTerm);
    const filtered = shopPosts.filter((post) => {
      const matchesSearchTerm = post.tag
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      // const matchesLocation = !location || (post.location && post.location.toLowerCase().includes(location.toLowerCase()));
      const matchesLocation =
        !userLocation ||
        (post.location &&
          post.location.toLowerCase().includes(userLocation.toLowerCase()));
      return matchesSearchTerm && matchesLocation;
    });
    setFilteredPosts(filtered);
    navigate(`/shop?search=${searchTerm}&location=${userLocation}`);
  };
  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${categoryName}`);
  };

  const checkUser = () => {
    if (!user) return;
    setIsUser(true);
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handleLogout = async () => {
    if (user) {
      try {
        await signOut(auth);
      } catch (err) {
        console.log(err.message);
      } finally {
        window.location.reload();
      }
    }
  };
  // const handleLogout = async () => {
  //   if (!user) return;
  //   try {
  //     signOut(auth);
  //   } catch (err) {
  //     console.log(err.message);
  //   } finally {
  //     window.location.reload();
  //   }
  // };
  const handleSearchClick = (data) => {
    console.log(data);
  };
  console.log(user);
  return (
    <>
      <Box
        className="mainWrapper"
        h="100vh"
        fontFamily={primaryFont}
        overflowY="auto"
      >
        <Flex justify="space-between" align="center" className="navWrapper">
          <Box onClick={() => navigate("/")} cursor="pointer" ml="-24px">
            <Image
              src={require("../../../assets/logo.svg").default}
              alt="aquarizz-logo"
            />
          </Box>
          <Flex
            className="navbarButtons"
            justify="end"
            align="center"
            mr="24px"
          >
            <NavLink to="/marketplace">
              <Button
                variant="none"
                color="#000"
                rightIcon={<ShoppingBag size={16} />}
                // _hover={{ bg: "rgba(255,255,255,.3)" }}
                // onClick={() => {
                //   navigate("/shop");
                // }}
              >
                Marketplace
              </Button>
            </NavLink>

            <NavLink to="/discover">
              <Button
                variant="none"
                color="#000"
                rightIcon={<Compass size={16} />}
                // _hover={{
                //   bg: "rgba(255,255,255,.3)",
                // }}
              >
                Discover
              </Button>
            </NavLink>

            {userProfile ? (
              <>
                {userProfile && (
                  <Menu>
                    <MenuButton>
                      <Flex justify="center" align="center" mx="32px">
                        <Avatar
                          size="sm"
                          name={userProfile.name}
                          scr={
                            userProfile.profileImage || "/path/to/avatar.jpg"
                          }
                        />
                        {/* {userProfile.name.charAt(0).toUpperCase()} */}
                      </Flex>
                    </MenuButton>
                    <MenuList>
                      <MenuGroup title="Profile">
                        <MenuItem>My Account</MenuItem>
                        <MenuItem>My Shop</MenuItem>
                      </MenuGroup>
                      <MenuDivider />
                      <MenuGroup title="Support">
                        <MenuItem onClick={() => setIsContactModalOpen(true)}>
                          Contact Us
                        </MenuItem>
                        <Contact
                          isOpen={isContactModalOpen}
                          onClose={() => setIsContactModalOpen(false)}
                        />
                        <MenuItem
                          onClick={() => {
                            navigate(`/faqs`);
                          }}
                        >
                          FAQs
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            navigate(`/return&exchange`);
                          }}
                        >
                          Return & Exchanges
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            navigate(`/Privacypolicy`);
                          }}
                        >
                          Privacy Policy
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            navigate(`/terms-of-service`);
                          }}
                        >
                          Terms of Service
                        </MenuItem>
                      </MenuGroup>
                      <MenuDivider />
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </MenuList>
                  </Menu>
                )}
              </>
            ) : (
              <Button
                variant="none"
                bg={primaryColor}
                rightIcon={<User size={16} />}
                _hover={{ bg: "rgba(255,255,255,.3)" }}
                onClick={loginModal.onOpen}
              >
                <LoginModal
                  isOpen={loginModal.isOpen}
                  onClose={loginModal.onClose}
                />
                Login
              </Button>
            )}
          </Flex>
          <Box className="navbarMobiles" mr="42px">
            <Button color="#000" onClick={onOpen} variant="ghost">
              <HamburgerIcon size={32} mr="-48px" />
            </Button>
            <Drawer placement="right" isOpen={isOpen} onClose={onClose}>
              <DrawerOverlay />
              <DrawerContent>
                <DrawerHeader>
                  <Flex
                    flexDirection="column"
                    justify="center"
                    align="center"
                    my="14px"
                  >
                    <Flex justify="center" align="center" mx="32px">
                      {userProfile && (
                        <Avatar
                          size="xl"
                          name={userProfile.name}
                          scr={
                            userProfile.profileImage || "/path/to/avatar.jpg"
                          }
                        />
                      )}
                      {/* {userProfile.name.charAt(0).toUpperCase()} */}
                    </Flex>
                    <Box mt="12px">
                      {!userProfile ? (
                        <Button
                          variant="link"
                          fontSize="md"
                          onClick={loginModal.onOpen}
                        >
                          Please&nbsp;<u>login</u>&nbsp;to continue
                        </Button>
                      ) : (
                        <Menu>
                          <MenuButton>{userProfile.email}</MenuButton>
                          <MenuList>
                            <MenuGroup title="Profile">
                              <MenuItem>My Account</MenuItem>
                              <MenuItem>My Shop</MenuItem>
                            </MenuGroup>
                            <MenuDivider />
                            <MenuGroup title="Support">
                              <MenuItem>Contact Us</MenuItem>
                              <MenuItem>FAQs</MenuItem>
                              <MenuItem>Return & Exchanges</MenuItem>
                              <MenuItem>Privacy Policy</MenuItem>
                              <MenuItem>Terms of Service</MenuItem>
                            </MenuGroup>
                            <MenuDivider />
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </Box>
                  </Flex>
                </DrawerHeader>
                <DrawerBody>
                  <Flex w="100%" align="start" flexDirection="column">
                    <Button
                      variant="ghost"
                      color="#000"
                      leftIcon={<ShoppingBag size={20} />}
                      _hover={{ bg: "rgba(255,255,255,.3)" }}
                      onClick={() => {
                        navigate("/shop");
                      }}
                      size="lg"
                    >
                      Shop
                    </Button>
                    <Button
                      variant="ghost"
                      color="#000"
                      leftIcon={<Compass size={20} />}
                      _hover={{
                        bg: "rgba(255,255,255,.3)",
                      }}
                      onClick={() => {
                        navigate("/discover");
                      }}
                      size="lg"
                    >
                      Discover
                    </Button>

                    <Button
                      w="100%"
                      bg={primaryColor}
                      color="#000"
                      leftIcon={<Edit size={16} />}
                      _hover={{ bg: "rgba(255,255,255,.3)" }}
                      onClick={() => {
                        user ? (
                          navigate("/shop")
                        ) : (
                          <>
                            {loginModal.onOpen()}
                            <LoginModal
                              isOpen={loginModal.isOpen}
                              onClose={loginModal.onClose}
                            />
                          </>
                        );
                      }}
                      size="lg"
                    >
                      Create listing
                    </Button>
                  </Flex>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </Box>
        </Flex>
        <Box className="contentWrapper" p="32px 0">
          <Box className="titleText" textAlign="center" p="56px 12px" w="100%">
            <Heading fontFamily={primaryFont} fontWeight="600">
              Connecting for the love of having a healthy fish.
            </Heading>
            <Text
              fontFamily={primaryFont}
              fontWeight="300"
              fontSize="xl"
              color="#fff"
            >
              A social media community to connect and sell your items.
            </Text>
          </Box>

          <Flex
            bg="rgba(255,255,255,.2)"
            m="0 auto 32px"
            borderRadius="32px"
            p="81px 64px"
            w="60%"
            className="cardWrapper"
            position="relative"
            overflow="hidden"
          >
            <Box w="100%">
              <Heading fontSize="46px" color="#333333">
                We are Aquarizz!
              </Heading>
              <Text mt="56px" maxW="500px" fontSize="2xl">
                A modern social media community that enables people to shop,
                discover, and sell for your fishkeeping!
              </Text>
              <Button
                onClick={() => loginModal.onOpen()}
                mt="81px"
                bg={primaryColor}
                color="#333333"
                p="20px 40px"
              >
                Become a part now!
              </Button>
            </Box>
            <Box w="100%" className="info"></Box>
          </Flex>

          {/* <Box className="cardWrapper__mobile" overflow="none">
            <Heading className="slidingContent" size="lg">
              A modern social media community that enables people to shop,
              discover, and sell for your fishkeeping!
            </Heading>
          </Box> */}
          {/* <Box className="searchbarWrapper">
            <SearchInput handleSearch={handleSearchShop} /> */}
          {/* <SearchInput handleSearch={handleSearchShop} setSearchTerm={setSearchTerm} searchTerm={searchTerm} userLocation={location} setLocation={setLocation} /> */}
          {/* </Box> */}

          {/* <Box className="searchBoxes" my="32px" w="100%" textAlign="center">
            <Box my="56px">
              <Heading size="md" fontFamily={primaryFont}>
                Explore the shop now!
              </Heading>
            </Box>
            <Flex
              className="tagsWrapper"
              justify="center"
              align="center"
              flexWrap="wrap"
              flexGrow="shrink"
            >
              <Box
                className="fishWrapper"
                mb="12px"
                onClick={() => handleCategoryClick("Fish")}
                cursor="pointer"
              >
                <Box overflow="hidden" borderRadius="4px">
                  <Image
                    h="200px"
                    w="200px"
                    objectFit="cover"
                    className="fish"
                    src={require("../../../assets/design/fishes.jpg")}
                  />
                </Box>

                <Heading fontSize="xl" mt="4px" color="#000">
                  Fish
                </Heading>
                <Flex justify="center" align="center">
                  <Text mr="6px">See all</Text>
                  <ArrowRight size={16} />
                </Flex>
              </Box>

              <Box
                className="decorWrapper"
                mb="12px"
                onClick={() => handleCategoryClick("Accessories")}
                cursor="pointer"
              >
                <Box overflow="hidden" borderRadius="4px">
                  <Image
                    h="200px"
                    w="200px"
                    objectFit="cover"
                    className="decor"
                    src={require("../../../assets/design/decor.jpg")}
                  />
                </Box>
                <Heading fontSize="xl" mt="4px" color="#000">
                  Accessories
                </Heading>
                <Flex justify="center" align="center">
                  <Text mr="6px">See all</Text>
                  <ArrowRight size={16} />
                </Flex>
              </Box>

              <Box
                className="feedsWrapper"
                onClick={() => handleCategoryClick("Feeds")}
                cursor="pointer"
              >
                <Box overflow="hidden" borderRadius="4px">
                  <Image
                    h="200px"
                    w="200px"
                    objectFit="cover"
                    className="feeds"
                    src={require("../../../assets/design/feeds.jpg")}
                  />
                </Box>
                <Heading fontSize="xl" mt="4px" color="#000">
                  Feeds
                </Heading>
                <Flex justify="center" align="center">
                  <Text mr="6px">See all</Text>
                  <ArrowRight size={16} />
                </Flex>
              </Box>

              <Box
                className="aquariumWrapper"
                onClick={() => handleCategoryClick("Aquarium")}
                cursor="pointer"
              >
                <Box overflow="hidden">
                  <Image
                    h="200px"
                    w="200px"
                    objectFit="cover"
                    className="aquarium"
                    src={require("../../../assets/design/aquarium.png")}
                  />
                </Box>
                <Heading fontSize="xl" mt="4px" color="#000">
                  Aquarium
                </Heading>
                <Flex justify="center" align="center">
                  <Text mr="6px">See all</Text>
                  <ArrowRight size={16} />
                </Flex>
              </Box>
            </Flex>
          </Box> */}
        </Box>
        <Footer />
      </Box>
    </>
  );
};
export default LandingPageMarket;
