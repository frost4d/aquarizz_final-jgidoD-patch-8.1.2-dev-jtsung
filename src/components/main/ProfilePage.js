import "./ProfilePage.css";
import React, { useEffect, useRef, useState } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
  Link,
  useLocation,
} from "react-router-dom";
import Navigation from "./revisionmain/Navigation";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import {
  Box,
  Heading,
  useCardStyles,
  Card,
  Flex,
  Text,
  MenuButton,
  Menu,
  MenuItem,
  MenuList,
  IconButton,
  Image,
  MenuGroup,
  MenuDivider,
  Button,
  useDisclosure,
  Modal,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  useEditableControls,
  Editable,
  Input,
  EditableInput,
  EditablePreview,
  ButtonGroup,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  ModalOverlay,
  InputGroup,
  InputLeftAddon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { db, auth, storage } from "../../firebase/firebaseConfig";
import { UserAuth } from "../context/AuthContext";
import { HamburgerIcon, SmallAddIcon, CheckCircleIcon } from "@chakra-ui/icons";
import {
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  updateProfile,
  getAuth,
  getAdditionalUserInfo,
} from "firebase/auth";
import { formatDistanceToNow } from "date-fns";
import Profile from "./Profile";
import PostOptions from "./mainComponents/PostOptions";
import {
  Home,
  Compass,
  User,
  LogOut,
  Edit,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Edit2,
} from "react-feather";
import Comment from "./mainComponents/Comment";
import { useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import Footer from "./revisionmain/Footer";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
function EditableControls() {
  const {
    isEditing,
    getSubmitButtonProps,
    getCancelButtonProps,
    getEditButtonProps,
  } = useEditableControls();

  return isEditing ? (
    <ButtonGroup>
      <IconButton icon={<Check />} {...getSubmitButtonProps()} />
      <IconButton icon={<X />} {...getCancelButtonProps()} />
    </ButtonGroup>
  ) : (
    <Flex justifyContent="center">
      <IconButton size="sm" icon={<Edit />} {...getEditButtonProps()} />
    </Flex>
  );
}

function ProfilePage() {
  const { userId } = useParams();
  // const { postId } = useParams();
  const { user } = UserAuth();
  const [userData, setUserData] = useState(null);
  const [postData, setPostData] = useState(null);
  const [newPassword, setNewPassword] = useState();
  const [profileImage, setProfileImage] = useState();
  const [imageUrl, setImageUrl] = useState();
  const navigate = useNavigate();
  const changePass = useDisclosure();
  const clear = useRef();
  const toast = useToast();
  const alert = useDisclosure();
  const profile = useDisclosure();
  const [shopPosts, setShopPosts] = useState([]);
  const [discoverPosts, setDiscoverPosts] = useState([]);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  console.log(user);
  const handleSignOut = () => {
    signOut(auth);
    navigate("/");
  };

  //check the location
  let getUrl = window.location.href;
  //take out every `/` to array
  let splitUrl = getUrl.split("/");

  const loadData = async () => {
    if (!userId) return; // Handle missing ID

    // const docRef = collection(db, "users1"); // Replace "db" with  Firestore instance
    // const docSnap = query(docRef, where("userID", "==", splitUrl[4]));
    // const userDataVar = await getDocs(docSnap);
    // let testData = userDataVar.forEach((doc) => doc.id);
    // console.log(testData);

    const docRef = collection(db, "users1"); // Replace "db" with  Firestore instance
    const docSnap = query(docRef, where("userID", "==", userId));
    const userDataVar = await getDocs(docSnap);
    let tempArr = [];
    let testData = userDataVar.forEach((doc) => {
      tempArr.push(doc.data());
    });
    setUserData(...tempArr);
  };

  useEffect(() => {
    loadData();
  }, []);
  const handleChangePassword = async (data) => {
    console.log(data);

    if (user) {
      try {
        await updatePassword(user, data.changePassword).then(() => {
          toast({
            title: "Password Changed.",
            description: "Nice! Password is successfully changed.",
            status: "success",
            duration: 3000,
            position: "top",
          });
        });
      } catch (err) {
        toast({
          title: "Action can't be done.",
          description:
            "Sorry, there seems to be a problem with the action you're trying. Please try loggin in again and repeat the action.",
          status: "error",
          duration: 3000,
          position: "top",
        });
      }
    }
    reset();
  };

  useEffect(() => {
    const fetchUserDiscoverPosts = async () => {
      if (!userId) return;
      const docRef = collection(db, "discover");
      const docSnap = query(docRef, where("authorID", "==", userId));
      const postDataVar = await getDocs(docSnap);
      let tempArr = [];
      postDataVar.forEach((doc) => {
        tempArr.push({ ...doc.data(), id: doc.id });
      });
      setDiscoverPosts(tempArr);
    };
    fetchUserDiscoverPosts();
  }, [userId]);

  useEffect(() => {
    const fetchUserShopPosts = async () => {
      if (!userId) return;
      const docRef = collection(db, "shop");
      const docSnap = query(docRef, where("authorID", "==", userId));
      const postDataVar = await getDocs(docSnap);
      let tempArr = [];
      postDataVar.forEach((doc) => {
        tempArr.push({ ...doc.data(), id: doc.id });
      });
      setShopPosts(tempArr);
    };
    fetchUserShopPosts();
  }, [userId]);

  const handleProfileChange = async (e) => {
    setProfileImage(e.target.files[0]);
    const imageRef = ref(
      storage,
      `profileImages/${e.target.files[0].name + "&" + userData.name}`
    );
    try {
      await uploadBytes(imageRef, e.target.files[0]).then((snapshot) => {
        console.log("Uploaded a blob or file!");
        console.log(snapshot);
      });
      getDownloadURL(imageRef).then((url) => {
        console.log(url);
        if (url === null) {
          console.log("error");
        }
        setImageUrl(url);
      });
    } catch (err) {
      console.log(err.message);
    }
  };
  const handleSubmitProfilePicture = async (e) => {
    e.preventDefault();
    const userRef = doc(db, "users1", userData.userID);

    try {
      await updateDoc(userRef, {
        profileImage: imageUrl,
      });
      await updateProfile(user, {
        photoURL: imageUrl,
      });
      toast({
        title: "Profile Updated!",
        description: "Profile picture is successfully updated.",
        status: "success",
        duration: 5000,
        position: "top",
      });
    } catch (err) {
      console.log(err.message);
    }
    window.location.reload();
  };
  console.log(postData);
  const handleGetId = () => {};

  const handleCancelUpload = () => {};
  return (
    <>
      <Box position="relative">
        <Navigation />
        {userData && userData ? (
          <Box key={userData.id} zIndex="2">
            <Flex
              pt="24px"
              align="center"
              justify="center"
              flexDirection="column"
            >
              <Flex w="100%">
                <Box>
                  <Flex
                    justify="center"
                    align="center"
                    h="150px"
                    w="150px"
                    ml="200px"
                    borderRadius="50%"
                    className="imageFlex"
                  >
                    <Box
                      className="imageHoverOption"
                      bg={userData.userID !== user.uid ? "none" : ""}
                      display={userData.userID !== user.uid ? "none" : ""}
                    >
                      <Button
                        color="#fff"
                        variant="none"
                        leftIcon={<Edit2 size={16} color="#fff" />}
                        onClick={profile.onOpen}
                        display={
                          userData.userID !== user.uid ? "none" : "block"
                        }
                      >
                        Edit
                        <Modal
                          size="xs"
                          isOpen={profile.isOpen}
                          onClose={profile.onClose}
                        >
                          <ModalOverlay />
                          <ModalContent>
                            <form>
                              <ModalBody>
                                <Flex
                                  p="32px 24px"
                                  w="100%"
                                  justify="center"
                                  align="center"
                                  flexDirection="column"
                                >
                                  <InputGroup
                                    display="flex"
                                    justifyContent="center"
                                    alignContent="center"
                                  >
                                    <FormLabel
                                      htmlFor="file"
                                      ml="2px"
                                      cursor="pointer"
                                      className="addImageButton"
                                      p="4px 8px"
                                      borderRadius="4px"
                                      display={profileImage ? "none" : "flex"}
                                      alignItems="center"
                                    >
                                      <SmallAddIcon />
                                      Click to Add Photo
                                    </FormLabel>

                                    <Input
                                      type="file"
                                      name="file"
                                      id="file"
                                      accept=".jpg, .jpeg, .png"
                                      multiple
                                      hidden
                                      onChange={handleProfileChange}
                                    />
                                    {profileImage && profileImage ? (
                                      <Flex
                                        w="100%"
                                        justify="center"
                                        align="center"
                                        flexDirection="column"
                                      >
                                        {" "}
                                        <Text as="b">
                                          Image is ready for upload!
                                        </Text>
                                        <br />
                                        <br />
                                        <Box
                                          h="150px"
                                          w="150px"
                                          borderRadius="50%"
                                          overflow="hidden"
                                        >
                                          <Image w="100%" src={imageUrl} />
                                        </Box>
                                      </Flex>
                                    ) : (
                                      <></>
                                    )}
                                  </InputGroup>
                                  <Flex
                                    mt="32px"
                                    w="100%"
                                    justify="space-around"
                                    align="center"
                                  >
                                    <Button
                                      colorScheme="telegram"
                                      onClick={handleSubmitProfilePicture}
                                    >
                                      Upload
                                    </Button>
                                    <Button
                                      variant="none"
                                      onClick={() => {
                                        profile.onClose();
                                        setImageUrl("");
                                        setProfileImage("");
                                      }}
                                    >
                                      Close
                                    </Button>
                                  </Flex>
                                </Flex>
                              </ModalBody>
                            </form>
                          </ModalContent>
                        </Modal>
                      </Button>
                    </Box>
                    {userData.profileImage ? (
                      <Image
                        h="100%"
                        w="100%"
                        objectFit="cover"
                        className="profilePicture"
                        src={userData.profileImage}
                      />
                    ) : (
                      <Text>User Avatar</Text>
                    )}
                  </Flex>
                </Box>

                <Flex mx="100px" flexDirection="column">
                  {/* <Button onClick={handleGetId}>Function</Button> */}
                  <Box>
                    <Heading>{userData.name}</Heading>
                    <Text fontSize="sm">
                      <strong>UID: </strong>
                      {userData.userID}
                    </Text>
                    <Text color="#9c9c9c" fontSize="xs" as="i">
                      Member since {formatDistanceToNow(userData.dateCreated)}{" "}
                      ago
                    </Text>
                  </Box>

                  <br />

                  <Box>
                    <Text>
                      <strong>Location: </strong>
                      {userData.location}
                    </Text>
                    <Text>
                      <strong>Email: </strong>
                      {userData.email}
                    </Text>
                    <Text>
                      <strong>Phone Number: </strong>
                      {userData.phoneNumber}
                    </Text>
                  </Box>
                </Flex>
                <Box display={userData.userID !== user.uid ? "none" : ""}>
                  {/* <Button
                    onClick={() => {
                      editProfile.onOpen();
                    }}
                    variant="outline"
                  >
                    <Settings />
                  </Button> */}
                  <Menu>
                    {({ isOpen }) => (
                      <>
                        <MenuButton
                          isActive={isOpen}
                          as={IconButton}
                          variant="outline"
                          icon={isOpen ? <ChevronUp /> : <ChevronDown />}
                          bg="#fff"
                        ></MenuButton>
                        <MenuList>
                          {/* <MenuItem>Edit</MenuItem> */}
                          <MenuItem onClick={changePass.onOpen}>
                            Change Password
                          </MenuItem>
                          <Modal
                            className="modalPassword"
                            isOpen={changePass.isOpen}
                            isClose={changePass.isClose}
                          >
                            <ModalOverlay />
                            <ModalContent>
                              <ModalHeader>Change Password</ModalHeader>
                              <form
                                onSubmit={handleSubmit(handleChangePassword)}
                              >
                                <ModalBody>
                                  <Input
                                    mt="12px"
                                    type="password"
                                    placeholder="Enter new password"
                                    {...register("changePassword", {
                                      required: true,
                                      minLength: {
                                        value: 6,
                                        message:
                                          "Password must be at least 6 characters.",
                                      },
                                    })}
                                    aria-invalid={
                                      errors.changePassword ? "true" : "false"
                                    }
                                    id="changePassword"

                                    // onChange={(e) => {
                                    //   setNewPassword(e.target.value);
                                    // }}
                                    // ref={clear}
                                  />
                                  {errors.changePassword?.type ===
                                    "required" && (
                                    <p
                                      style={{
                                        color: "#d9534f",
                                        fontSize: "12px",
                                      }}
                                    >
                                      Confirm Password is required
                                    </p>
                                  )}
                                  <Input
                                    mt="12px"
                                    type="password"
                                    placeholder="Confirm new password"
                                    {...register("confirmPassword", {
                                      required: true,
                                      minLength: {
                                        value: 6,
                                        message:
                                          "Password must be at least 6 characters.",
                                      },
                                      validate: (val) => {
                                        if (watch("changePassword") !== val) {
                                          return "Password do not match!";
                                        }
                                      },
                                    })}
                                    aria-invalid={
                                      errors.confirmPassword ? "true" : "false"
                                    }
                                    id="confirmPassword"

                                    // onChange={(e) => {
                                    //   setNewPassword(e.target.value);
                                    // }}
                                    // ref={clear}
                                  />
                                  {errors.confirmPassword?.type ===
                                    "required" && (
                                    <p
                                      style={{
                                        color: "#d9534f",
                                        fontSize: "12px",
                                      }}
                                    >
                                      Confirm Password is required
                                    </p>
                                  )}
                                  {errors?.confirmPassword && (
                                    <p
                                      style={{
                                        color: "#d9534f",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {errors.confirmPassword.message}
                                    </p>
                                  )}

                                  <Flex justify="end" align="center" w="100%">
                                    <Button
                                      type="submit"
                                      colorScheme="telegram"
                                      mt="12px"
                                    >
                                      Change
                                    </Button>
                                    <Button
                                      onClick={changePass.onClose}
                                      mt="12px"
                                    >
                                      Cancel
                                    </Button>
                                  </Flex>
                                </ModalBody>
                              </form>
                            </ModalContent>
                          </Modal>
                        </MenuList>
                      </>
                    )}
                  </Menu>
                </Box>
              </Flex>

              <Flex
                w="100%"
                // h="70vh"
                justify="center"
                align="center"
                flexDirection="column"
                boxShadow="0px -4px 5px #e1e1e1"
                mt="32px"
                pt="24px"
              >
                {shopPosts.length === 0 ? (
                  <Flex justify="center" align="center">
                    <Text color="#7f7f7f">It feels so lonely here...</Text>
                  </Flex>
                ) : (
                  <>
                    <Tabs
                      size="md"
                      variant="enclosed"
                      w="100%"
                      justify="center"
                      align="center"
                    >
                      <TabList mb="1em">
                        <Tab w="8%">Posts</Tab>
                        <Tab w="8%">Shop</Tab>
                        <Tab w="8%">About</Tab>
                      </TabList>
                      <TabPanels>
                        <TabPanel>
                          <Flex
                            flexDirection="column"
                            w="100%"
                            align="center"
                            justify="center"
                          >
                            {discoverPosts.map((post) => (
                              <Card
                                key={post.id}
                                w="50%"
                                p="24px 24px"
                                my="16px"
                                border="1px solid #e1e1e1"
                              >
                                <Flex flexDirection="column">
                                  <Box>
                                    <Profile
                                      name={post.name}
                                      authorId={post.authorId}
                                    />
                                  </Box>
                                  <PostOptions
                                    postId={post.id}
                                    authorId={post.authorId}
                                  />
                                  <Text
                                    as="kbd"
                                    fontSize="10px"
                                    color="gray.500"
                                  >
                                    {formatDistanceToNow(post.createdAt)} ago
                                  </Text>
                                  <Button variant="link" color="#333333">
                                    {post.authorName}
                                  </Button>

                                  <Flex
                                    pl="32px"
                                    py="32px"
                                    justify="space-between"
                                  >
                                    <Box>
                                      <Link to={"/AddToCart/" + post.id}>
                                        <Heading size="md">
                                          {post.postTitle}
                                        </Heading>
                                      </Link>
                                      <br />

                                      <Text
                                        className="truncate"
                                        fontSize="16px"
                                        textAlign="justify"
                                      >
                                        {post.postContent}
                                      </Text>
                                    </Box>

                                    <Box mr="24px">
                                      {!post.price ? (
                                        <Text>₱ 0.00</Text>
                                      ) : (
                                        <>
                                          <strong>₱ </strong>
                                          {post.price}
                                        </>
                                      )}
                                    </Box>
                                  </Flex>
                                  <Flex
                                    w="100%"
                                    align="center"
                                    justify="center"
                                  >
                                    <Image
                                      src={post.postImage}
                                      w="40em"
                                      alt="post image"
                                      onError={(e) =>
                                        (e.target.style.display = "none")
                                      }
                                    />
                                  </Flex>
                                  <Box w="100%">
                                    <Comment
                                      postID={post.id}
                                      authorId={post.authorId}
                                    />
                                  </Box>
                                </Flex>
                              </Card>
                            ))}
                          </Flex>
                        </TabPanel>
                        <TabPanel>
                          {/* <Flex
                            flexDirection="column"
                            w="100%"
                            align="center"
                            justify="center"
                          > */}

                          {/* <Flex
                            flexDirection="row"
                            flexWrap="wrap"
                            justify="center"
                          > */}

                          <Grid
                            className="gridItem__holder"
                            templateColumns={`repeat(5, 1fr)`}
                            gap="2"
                            autoRows="minmax(200px, auto)"
                            rowGap={4}
                          >
                            {shopPosts.map((post) => (
                              // <Card
                              //   key={post.id}
                              //   w={{ base: "100%", md: "45%", lg: "30%" }}
                              //   m="8px"
                              //   // p="24px 24px"
                              //   // my="16px"
                              //   border="1px solid #e1e1e1"
                              // >
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
                                <Flex flexDirection="column">
                                  <Box>
                                    <Profile
                                      name={post.name}
                                      authorId={post.authorId}
                                    />
                                  </Box>
                                  <PostOptions
                                    postId={post.id}
                                    authorId={post.authorId}
                                  />
                                  {/* <Text
                                    as="kbd"
                                    fontSize="10px"
                                    color="gray.500"
                                  >
                                    {formatDistanceToNow(post.createdAt)} ago
                                  </Text>
                                  <Button variant="link" color="#333333">
                                    {post.authorName}
                                  </Button> */}

                                  <Flex
                                    w="100%"
                                    align="center"
                                    justify="center"
                                  >
                                    <Image
                                      src={post.postImage}
                                      objectFit="cover"
                                      w="100%"
                                      h="250px"
                                      alt="post image"
                                      onError={(e) =>
                                        (e.target.style.display = "none")
                                      }
                                    />
                                  </Flex>
                                  <Flex
                                    pl="32px"
                                    py="32px"
                                    justify="space-between"
                                  >
                                    <Box>
                                      <Link to={"/AddToCart/" + post.id}>
                                        <Heading size="md">
                                          {post.postTitle}
                                        </Heading>
                                      </Link>
                                      <br />

                                      <Text
                                        className="truncate"
                                        fontSize="16px"
                                        textAlign="justify"
                                      >
                                        {post.postContent}
                                      </Text>
                                    </Box>

                                    <Box mr="34px">
                                      {!post.price ? (
                                        <Text>₱ 0.00</Text>
                                      ) : (
                                        <>
                                          <strong>₱ </strong>
                                          {post.price}
                                        </>
                                      )}
                                    </Box>
                                  </Flex>
                                  {/* <Flex
                                    w="100%"
                                    align="center"
                                    justify="center"
                                  >
                                    <Image
                                      src={post.postImage}
                                      objectFit="cover"
                                      w="100%"
                                      h="250px"
                                      alt="post image"
                                      onError={(e) =>
                                        (e.target.style.display = "none")
                                      }
                                    />
                                  </Flex> */}
                                  {/* <Box w="100%">
                                    <Comment
                                      postID={post.id}
                                      authorId={post.authorId}
                                    />
                                  </Box> */}
                                </Flex>
                                {/* </Card> */}
                              </GridItem>
                            ))}
                            {/* </Flex> */}
                          </Grid>
                        </TabPanel>
                        <TabPanel>
                          <Flex
                            flexDirection="column"
                            w="100%"
                            align="center"
                            justify="center"
                          >
                            {userData && (
                              <Card
                                w="50%"
                                p="24px 24px"
                                my="16px"
                                border="1px solid #e1e1e1"
                              >
                                <Flex flexDirection="column">
                                  <Box>
                                    <Heading as="h2" size="lg">
                                      About {userData.name}
                                    </Heading>
                                    <Text color="#9c9c9c" fontSize="sm" as="i">
                                      Member since{" "}
                                      {formatDistanceToNow(
                                        userData.dateCreated
                                      )}{" "}
                                      ago
                                    </Text>
                                    <Text fontSize="lg">
                                      <strong>Location: </strong>
                                      {userData.location}
                                    </Text>
                                    <Text fontSize="lg">
                                      <strong>Email: </strong>
                                      {userData.email}
                                    </Text>
                                    <Text fontSize="lg">
                                      <strong>Phone Number: </strong>
                                      {userData.phoneNumber}
                                    </Text>
                                  </Box>
                                </Flex>
                              </Card>
                            )}
                          </Flex>
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </>
                )}
              </Flex>
            </Flex>
          </Box>
        ) : (
          <Flex w="100%" h="100vh" align="center" justify="center">
            <span className="loader"></span>
          </Flex>
        )}
      </Box>
      <Footer />
    </>
  );
}

export default ProfilePage;
