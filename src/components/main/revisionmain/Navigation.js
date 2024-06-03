import "./Navigation.css";
import React, { useState } from "react";
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

const Navigation = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const loginModal = useDisclosure();
  const primaryColor = "#FFC947";
  const primaryFont = '"Poppins", sans-serif';
  const secondaryFont = '"Montserrat", sans-serif';
  const navigate = useNavigate();
  const { user, userProfile } = UserAuth();

  const [cartItemCount, setCartItemCount] = useState(0);

  const incrementBadgeCount = () => {
    setCartItemCount(cartItemCount + 1);
  };

  const handleLogout = async () => {
    if (!user) return;
    try {
      signOut(auth);
    } catch (err) {
      console.log(err.message);
    } finally {
      window.location.reload();
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
        >
          <Box
            className="logoWrapper"
            onClick={() => {
              window.location.reload();
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
                // variant="ghost"
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
                // variant="ghost"
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
              <NavLink to="/CartPage">
                <Button
                  borderRadius="0"
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
                <Menu>
                  <MenuButton>{userProfile.email}</MenuButton>
                  <MenuList>
                    <MenuGroup title="Profile">
                      <MenuItem>My Account</MenuItem>
                      <MenuItem>My Shop</MenuItem>
                      <MenuItem>
                        <Link to="/ItemStatusPage">Check Item Status</Link>
                      </MenuItem>
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
            >
              Create listing
            </Button>
          </Flex>
          <Box mr="42px">
            <Button variant="ghost" onClick={onOpen}>
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
                    <Flex
                      justify="center"
                      align="center"
                      h="100px"
                      w="100px"
                      bg="gray.300"
                      borderRadius="50%"
                    >
                      <User color="#ffff" size={60} />
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
                            <Badge colorScheme="red" borderRadius="full" px="2">
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
                    >
                      Create listing
                    </Button>
                  </Flex>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </Box>
        </Flex>
      </Box>
    </>
  );
};
export default Navigation;
