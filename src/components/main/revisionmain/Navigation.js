import "./Navigation.css";
import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Image,
  Text,
  Heading,
  Input,
  Button,
  Badge,
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
  DrawerContent,
  DrawerBody,
  DrawerHeader,
  Avatar,
} from "@chakra-ui/react";
import {
  User,
  Edit,
  Search,
  MapPin,
  Compass,
  ShoppingBag,
  ArrowRight,
  Facebook,
  Mail,
  Twitter,
  ShoppingCart,
} from "react-feather";
import LoginModal from "./LoginModal";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import logo from "../../../assets/logo2.png";
import { ChevronDownIcon, HamburgerIcon } from "@chakra-ui/icons";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/firebaseConfig";
import Contact from "../../Contact";
import Create from "./listing/Create";
import AddDiscoverModal from "./AddDiscoverModal";


const Navigation = ({ cartItemCount, setCartItemCount }) => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const loginModal = useDisclosure();
  const primaryColor = "#FFC947";
  const primaryFont = '"Poppins", sans-serif';
  const secondaryFont = '"Montserrat", sans-serif';
  const navigate = useNavigate();
  const { user, userProfile } = UserAuth();

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const modalShop = useDisclosure();

  useEffect(() => {
    // Get cart items from local storage
    const existingItems = JSON.parse(localStorage.getItem("wishlist")) || [];
    // Update cart item count if setCartItemCount is a function
    if (typeof setCartItemCount === "function") {
      setCartItemCount(existingItems.length);
    }
  }, [setCartItemCount]);
  

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
  return (
    <>
      <Box className="navWrapper__dashboard">
        <Flex
          className="navContents__dashboard"
          as="nav"
          align="center"
          justify="space-between"
          // borderWidth="2px"
          // borderColor="blue"
        >
          <Box
            className="logoWrapper"
            onClick={() => {
              navigate("/");
            }}
            cursor="pointer"
            ml="-24px"
          >
            <Image
              src={require("../../../assets/logo.svg").default}
              alt="aquarizz-logo"
            />
          </Box>
          <Flex
            className="navbarButtons__dashboard"
            justify="end"
            align="center"
            w="100%"
          >
            <NavLink
              className={({ isActive }) =>
                isActive ? "navlink_isActive" : "navlink_inactive"
              }
              to="/shop"
            >
              <Button
                borderRadius="0"
                variant="ghost"
                color="#000"
                rightIcon={<ShoppingBag size={16} />}
                // _hover={{ bg: "rgba(249,249,249,1)" }}
                // onClick={() => navigate("/shop")}
              >
                Shop
              </Button>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                isActive ? "navlink_isActive" : "navlink_inactive"
              }
              to="/discover"
            >
              <Button
                borderRadius="0"
                variant="ghost"
                color="#000"
                rightIcon={<Compass size={16} />}
                // _hover={{
                //   bg: "rgba(249,249,249,1)",
                // }}
                // onClick={() => navigate("/discover")}
              >
                Discover
              </Button>
            </NavLink>

            {!userProfile ? (
              ""
            ) : (
              <NavLink className={({ isActive }) =>
                isActive ? "navlink_isActive" : "navlink_inactive"
              } to="/CartPage">
                <Button
                  borderRadius="0"
                  variant="ghost"
                  color="#000"
                  rightIcon={
                    <Badge colorScheme="red" borderRadius="full" px="2">
                      {cartItemCount}
                    </Badge>
                  }
                >
                  <ShoppingCart size={16} />
                </Button>
              </NavLink>
            )}

            {userProfile ? (
              <>
                {userProfile && (
                  <Menu>
                    <MenuButton>
                      <Flex justify="center" align="center" mx="32px">
                        <Avatar
                          colorScheme={`"whiteAlpha" | "blackAlpha" | "gray"  "orange" | "yellow" | "green" | "teal" | "blue" | "cyan" | "purple" | "pink"`}
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
                        <MenuItem
                          onClick={() => {
                            navigate(`/profile/${user.uid}`);
                          }}
                        >
                          My Account
                        </MenuItem>
                        <MenuItem>
                          <Link to="/ItemStatusPage">Check Item Status</Link>
                        </MenuItem>
                        <MenuDivider />
                      </MenuGroup>
                      <MenuGroup title="My Shop">
                        <MenuItem
                          onClick={() => {
                            navigate(`/reports`);
                          }}
                        >
                          My Reports
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            navigate(`/transaction`);
                          }}
                        >
                          Transactions
                        </MenuItem>
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
                variant="ghost"
                color="#000"
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
            <Button
              bg={primaryColor}
              color="#000"
              rightIcon={<Edit size={16} />}
              _hover={{ bg: "#ffd36b" }}
              onClick={() => {
                user ? (
                  modalShop.onOpen()
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
            >
              Create listing
            </Button>
            <Create isOpen={modalShop.isOpen} onClose={modalShop.onClose} />
          </Flex>

          <Flex>
            <Box className="addNew__mobiles">
              <Button
                variant="outline"
                w="100%"
                mr="12px"
                // variant="ghost"
                rightIcon={<Edit size={16} />}
                onClick={addDiscover.onOpen}
              >
                <AddDiscoverModal
                  isOpen={addDiscover.isOpen}
                  onClose={addDiscover.onClose}
                />
                New Post
              </Button>
            </Box>
            <Box className="addNew__mobiles__icon">
              <Button
                variant="outline"
                w="100%"
                mr="12px"
                // variant="ghost"
                onClick={addDiscover.onOpen}
              >
                <AddDiscoverModal
                  isOpen={addDiscover.isOpen}
                  onClose={addDiscover.onClose}
                />
                <Edit size={16} />
              </Button>
            </Box>
            <Box
              className="navbarMobiles"
              mr="42px"
              display={{ base: "block", md: "none" }}
            >
              <Button variant="ghost" onClick={onOpen} mr="-30px">
                <HamburgerIcon size={32} />
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
                          <Text fontSize="md">Please login to continue</Text>
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
                    <Flex flexDirection="column">
                      <NavLink
                        // className={({ isActive }) =>
                        //   isActive ? "navlink_isActive" : "navlink_inactive"
                        // }
                        to="/shop"
                      >
                        <Button
                          borderRadius="0"
                          // variant="ghost"
                          color="#000"
                          leftIcon={<ShoppingBag size={20} />}
                          // _hover={{ bg: "rgba(249,249,249,1)" }}
                          // onClick={() => navigate("/shop")}
                          size="lg"
                        >
                          Shop
                        </Button>
                      </NavLink>
                      <NavLink
                        // className={({ isActive }) =>
                        //   isActive ? "navlink_isActive" : "navlink_inactive"
                        // }
                        to="/discover"
                      >
                        <Button
                          borderRadius="0"
                          // variant="ghost"
                          color="#000"
                          leftIcon={<Compass size={20} />}
                          size="lg"

                          // _hover={{
                          //   bg: "rgba(249,249,249,1)",
                          // }}
                          // onClick={() => navigate("/discover")}
                        >
                          Discover
                        </Button>
                      </NavLink>

                      {!userProfile ? (
                        ""
                      ) : (
                        <NavLink to="/CartPage">
                          <Button
                            borderRadius="0"
                            color="#000"
                            rightIcon={
                              <Badge
                                colorScheme="red"
                                borderRadius="full"
                                px="2"
                              >
                                {cartItemCount}
                              </Badge>
                            }
                          >
                            <ShoppingCart size={16} />
                          </Button>
                        </NavLink>
                      )}

                      <Button
                        bg={primaryColor}
                        color="#000"
                        leftIcon={<Edit size={20} />}
                        size="lg"
                        _hover={{ bg: "#ffd36b" }}
                        onClick={() => {
                          user ? (
                            <Create
                              isOpen={modalShop.isOpen}
                              onClose={modalShop.onClose}
                            />
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
                      >
                        Create listing
                      </Button>
                    </Flex>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </Box>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};
export default Navigation;
