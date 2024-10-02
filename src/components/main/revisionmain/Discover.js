import "./Discover.css";
import { useEffect, useState } from "react";
import { db } from "../../../firebase/firebaseConfig";
import {
  doc,
  getDocs,
  collection,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  where,
} from "firebase/firestore";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Heading,
  Image,
  Text,
  Input,
  useDisclosure,
  useToast,
  GridItem,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  Link,
  IconButton,
  Spinner,
  InputGroup,
  InputRightAddon,
  Tabs,
  TabList,
  Tab,
  TabIndicator,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "./Navigation";
import { Edit, Plus, Users, UserPlus, MapPin, Bold } from "react-feather";
import AddDiscoverModal from "./AddDiscoverModal";
import { UserAuth } from "../../context/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import Footer from "./Footer";
import PostModal from "./PostModal";
import LoginModal from "./LoginModal";
import { ChatIcon, SearchIcon } from "@chakra-ui/icons";
import { FaNewspaper, FaPlay } from "react-icons/fa";
// import SearchInput from "./components/SearchInput";
import { useForm } from "react-hook-form";

const Discover = () => {
  const navigate = useNavigate();
  const { user, userProfile } = UserAuth();
  const primaryColor = "#FFC947";
  const primaryFont = '"Poppins", sans-serif';
  const tertiaryColor = "#6e6e6e";
  const addDiscover = useDisclosure();
  const toast = useToast();
  const [discoverPosts, setDiscoverPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [post, setPost] = useState();
  const { postId, userId } = useParams();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState();
  const openLogin = useDisclosure();
  // const letter = userProfile.name.charAt(0);
  const [viewedPosts, setViewedPosts] = useState({}); // State to track viewed posts
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const { register, reset, handleSubmit } = useForm();
  const [tabIndex, setTabIndex] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState();

  useEffect(() => {
    const fetchDiscoverPosts = async () => {
      setLoading(true);
      try {
        const postsCollection = collection(db, "discover");
        const querySnapshot = await getDocs(postsCollection);
        const tempPosts = [];
        querySnapshot.forEach((doc) => {
          tempPosts.push({ id: doc.id, ...doc.data() });
        });
        setDiscoverPosts(tempPosts);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchDiscoverPosts();
  }, [userProfile]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users1");
        const querySnapshot = await getDocs(usersCollection);
        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersList);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();

      // Filter users and posts separately
      const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().startsWith(searchTermLower)
      );

      const filteredPosts = discoverPosts.filter(
        (post) =>
          // post.authorName?.toLowerCase().startsWith(searchTermLower) ||
          post.tag?.toLowerCase().startsWith(searchTermLower) ||
          post.postTitle?.toLowerCase().startsWith(searchTermLower) ||
          post.postContent?.toLowerCase().startsWith(searchTermLower)
      );

      // Combine and show top 5 suggestions with separation
      setSuggestions([
        ...filteredUsers.slice(0, 5).map((user) => ({ ...user, type: "user" })),
        ...filteredPosts.slice(0, 5).map((post) => ({ ...post, type: "post" })),
      ]);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, discoverPosts, users]);

  useEffect(() => {
    if (postId) {
      const fetchPost = async () => {
        try {
          const postRef = doc(db, "discover", postId);
          const postDoc = await getDoc(postRef);
          if (postDoc.exists()) {
            setSelectedPost({ id: postDoc.id, ...postDoc.data() });
            onOpen();
          } else {
            console.log("No such post!");
          }
        } catch (err) {
          console.log(err.message);
        }
      };
      fetchPost();
    }
  }, [postId]);
  //get users for userFilter
  useEffect(() => {
    const handleGetUsers = async () => {
      setLoading(true);
      try {
        const userCollection = collection(db, "users1");
        const snapShot = await getDocs(userCollection);
        const tempUsers = [];
        snapShot.forEach((doc) => {
          tempUsers.push({ id: doc.id, ...doc.data() });
        });
        setUsers(tempUsers);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
      }
    };
    handleGetUsers();
  }, []);
  const handleCardClick = (data) => {
    window.open(`/profile/${data}`, "_blank", "noopener,noreferrer");
  };

  const handleSearchDiscover = (data) => {
    setSearchTerm(data.searchTerm);
    const searchTermLower = data.searchTerm.toLowerCase();
    const filtered = discoverPosts.filter((post) => {
      return (
        // post.authorName?.toLowerCase().includes(searchTermLower) ||
        post.tag?.toLowerCase().includes(searchTermLower) ||
        post.postTitle?.toLowerCase().includes(searchTermLower) ||
        post.postContent?.toLowerCase().includes(searchTermLower) ||
        post.authorName?.toLowerCase().includes(searchTermLower)
      );
    });
    const filteredUser = users.filter((user) => {
      return user.name?.toLowerCase().includes(searchTermLower);
    });
    setFilteredPosts(filtered);
    setFilteredUsers(filteredUser);
  };

  console.log(filteredUsers);
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === "user") {
      navigate(`/profile/${suggestion.id}`);
    } else {
      setSearchTerm(suggestion.postContent || suggestion.tag);
    }
    setSuggestions([]);
    setFilteredPosts([suggestion]);
  };

  const handleAddDiscover = async (formData) => {
    try {
      const docRef = await addDoc(collection(db, "discover"), formData);
      setDiscoverPosts([...discoverPosts, { id: docRef.id, ...formData }]);
      setFilteredPosts([...discoverPosts, { id: docRef.id, ...formData }]);
      addDiscover.onClose();
      toast({
        title: "Post Created.",
        description: "Post successfully published.",
        status: "success",
        duration: 5000,
        position: "top",
      });
    } catch (err) {
      console.error("Error adding document: ", err);
    }
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
    onOpen();
  };

  const incrementViewCount = async (postId, userId) => {
    try {
      const postRef = doc(db, "discover", postId);
      const userViewRef = doc(db, "discover", postId, "userViews", userId);

      const postDoc = await getDoc(postRef);
      if (!postDoc.exists()) {
        console.error("Post does not exist");
        return;
      }

      const postData = postDoc.data();
      console.log(
        `Post author ID: ${postData.authorId}, Current user ID: ${userId}`
      );

      // Convert both to strings to ensure proper comparison
      if (String(postData.authorId) === String(userId)) {
        console.log("Author views are not counted");
        return;
      }

      const userViewDoc = await getDoc(userViewRef);
      if (!userViewDoc.exists()) {
        console.log(
          "User has not viewed the post yet. Incrementing view count."
        );

        await updateDoc(postRef, {
          views: increment(1),
        });

        await setDoc(userViewRef, {
          viewedAt: new Date(),
        });

        console.log("View count incremented and user view logged.");
      } else {
        console.log("User has already viewed the post.");
      }
    } catch (err) {
      console.error("Error updating view count: ", err);
    }
  };

  const handleVideoPlay = (post) => {
    if (!post || !user || !user.uid) {
      console.warn("Post or user data is not fully available.");
      return;
    }

    // Ensure this function only counts views for video posts
    if (!post.postVideo) {
      // console.log("This post is an image, views are not counted.");
      return;
    }

    if (String(post.authorId) === String(user.uid)) {
      // console.log("Author views are not counted");
      return; // Do not increment view count if the author is viewing
    }

    // Check if the view count has already been incremented for this post
    if (!viewedPosts[post.id]) {
      // Set a timer to count the view after 0 seconds
      const timer = setTimeout(() => {
        incrementViewCount(post.id, user.uid); // Increment the view count in Firestore
        setViewedPosts((prev) => ({ ...prev, [post.id]: true })); // Mark the post as viewed
      }, 0); // 0 seconds

      // Return the timer to be used for cleanup
      return timer;
    }
  };

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      if (!user || !user.uid) return;

      try {
        const followingCollection = collection(
          db,
          "users1",
          user.uid,
          "following"
        );
        const querySnapshot = await getDocs(followingCollection);
        const followedUsersList = [];

        querySnapshot.forEach((doc) => {
          followedUsersList.push(doc.id); // Assuming doc.id is the userId
        });

        setFollowedUsers(followedUsersList);
      } catch (err) {
        // console.log(err.message);
      }
    };

    fetchFollowedUsers();
  }, [user]);

  useEffect(() => {
    const fetchPostsFromFollowedUsers = async () => {
      if (followedUsers.length === 0) return;

      try {
        const postsCollection = collection(db, "discover");
        const query = query(
          postsCollection,
          where("authorId", "in", followedUsers)
        );
        const querySnapshot = await getDocs(query);
        const postsList = [];

        querySnapshot.forEach((doc) => {
          postsList.push({ id: doc.id, ...doc.data() });
        });

        setFilteredPosts(postsList);
      } catch (err) {
        // console.log(err.message);
      }
    };

    fetchPostsFromFollowedUsers();
  }, [followedUsers]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user || !user.uid) return;

      try {
        const friendsCollection = collection(db, "users1", user.uid, "friends"); // Adjust path as needed
        const querySnapshot = await getDocs(friendsCollection);
        const friendsList = querySnapshot.docs.map((doc) => doc.id); // Assuming doc.id is friendId

        setFriends(friendsList);
      } catch (err) {
        // console.log(err.message);
      }
    };

    fetchFriends();
  }, [user]);

  useEffect(() => {
    const fetchPostsFromFriends = async () => {
      if (friends.length === 0) return;

      try {
        const postsCollection = collection(db, "discover");
        const query = query(postsCollection, where("authorId", "in", friends));
        const querySnapshot = await getDocs(query);
        const postsList = [];

        querySnapshot.forEach((doc) => {
          postsList.push({ id: doc.id, ...doc.data() });
        });

        setFilteredPosts(postsList);
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          status: "error",
          duration: 1500,
          position: "top",
        });
      }
    };

    fetchPostsFromFriends();
  }, [friends]);

  const handleFriendsClick = () => {
    // Update the filtered posts based on friends list
    setFilteredPosts(
      discoverPosts.filter((post) => friends.includes(post.authorId))
    );
    navigate("/friendsPost");
  };
  const handleFollowingClick = () => {
    // Update the filtered posts based on friends list
    setFilteredPosts(
      discoverPosts.filter((post) => friends.includes(post.authorId))
    );
    navigate("/followingPost");
  };

  console.log(discoverPosts);
  return (
    <>
      <Box h="100vh" overflowY="auto">
        <Navigation
          cartItemCount={cartItemCount}
          setCartItemCount={setCartItemCount}
        />
        <Flex>
          <Box className="sidebar__container__discover">
            <Box
              w="250px"
              p="2"
              borderRight="1px solid #e1e1e1"
              position="sticky"
              top="0"
              left="0"
              h="100vh"
              bg="white"
              // border="2px"
            >
              <Flex
                w="100%"
                gap="24px 12px"
                justify="center"
                align="start"
                flexWrap="wrap"
              >
                {/* {userProfile && ( */}
                <Box
                  flex="1"
                  // border="1px solid #e1e1e1" borderColor="green"
                  className="bodyWrapper__profile"
                  // ml="24px"
                >
                  <Box mt="12px">
                    <Flex
                      className="userprofile__wrapper__discover"
                      flexDirection="column"
                      justify="center"
                      align="center"
                    >
                      {loading ? (
                        <Spinner />
                      ) : !userProfile ? (
                        <Button
                          p="16px 32px"
                          variant="link"
                          border="1px solid #e1e1e1"
                          onClick={() => {
                            openLogin.onOpen();
                          }}
                        >
                          <LoginModal
                            isOpen={openLogin.isOpen}
                            onClose={openLogin.onClose}
                          />
                          Please sign in first
                        </Button>
                      ) : (
                        userProfile && (
                          <Flex
                            justify="center"
                            flexDirection="column"
                            align="center"
                            p="24px"
                          >
                            <Avatar
                              size="xl"
                              name={userProfile.name}
                              src={
                                userProfile.profileImage ||
                                "/path/to/avatar.jpg"
                              }
                            />
                            <Box textAlign="center">
                              <Text fontSize="xs" mt="8px">
                                {!userProfile
                                  ? ""
                                  : userProfile &&
                                    ` User since: ${format(
                                      userProfile.dateCreated,
                                      "yyyy-MM-HH"
                                    )}`}
                              </Text>
                              <Heading size="md" mt="8px">
                                {userProfile.name}
                              </Heading>
                            </Box>

                            <Divider m="12px 0" />
                            <Box>
                              <Button
                                variant="outline"
                                w="100%"
                                mr="12px"
                                // variant="ghost"
                                rightIcon={<Edit size={16} />}
                                onClick={addDiscover.onOpen}
                                bg={primaryColor}
                                _hover={{ bg: "#ffd97e" }}
                              >
                                <AddDiscoverModal
                                  isOpen={addDiscover.isOpen}
                                  onClose={addDiscover.onClose}
                                />
                                New Post
                              </Button>
                            </Box>
                          </Flex>
                        )
                      )}
                    </Flex>
                  </Box>
                </Box>
                {/* )} */}

                {/* <Flex
                justify="center"
                align="center"
                flex="16"
                // borderWidth="2px" borderColor="red"
                m="24px 24px"
                className="bodyWrapper__contents"
              ></Flex>
              <Box flex="1"></Box> */}
              </Flex>

              <Flex direction="column" align="start">
                <Link
                  p="2"
                  mb="2"
                  w="100%"
                  fontWeight="bold"
                  _hover={{ bg: "#f0f0f0", borderRadius: "10px" }}
                  onClick={handleFollowingClick}
                >
                  <Flex align="center" ml="12px">
                    <UserPlus size={20} />
                    <Text ml="2" fontSize="lg">
                      Following
                    </Text>
                  </Flex>
                </Link>
                <Link
                  p="2"
                  mb="2"
                  w="100%"
                  fontWeight="bold"
                  _hover={{ bg: "#f0f0f0", borderRadius: "10px" }}
                  onClick={handleFriendsClick}
                >
                  <Flex align="center" ml="12px">
                    <Users size={20} />
                    <Text ml="2" fontSize="lg">
                      Friends
                    </Text>
                  </Flex>
                </Link>
                <Link
                  p="2"
                  mb="2"
                  w="100%"
                  fontWeight="bold"
                  _hover={{ bg: "#f0f0f0", borderRadius: "10px" }}
                  onClick={() => navigate("/chatMessage/:userId")}
                >
                  <Flex align="center" ml="12px">
                    <ChatIcon size={20} />
                    <Text ml="2" fontSize="lg">
                      Message
                    </Text>
                  </Flex>
                </Link>
              </Flex>
            </Box>
          </Box>
          <Box flex="1">
            <Flex justify="space-between" p="0 86px 0px 64px">
              <Heading>Discover</Heading>
            </Flex>

            <Box mb="12">
              {loading ? (
                <Flex w="100%" h="100vh" align="center" justify="center">
                  <span className="loader"></span>
                </Flex>
              ) : (
                <Flex
                  w="100%"
                  flexWrap="wrap"
                  justify="space-evenly"
                  align="center"
                >
                  <Flex maxW="80vw" w="100%" justify="center" p="12px 24px">
                    <form onSubmit={handleSubmit(handleSearchDiscover)}>
                      {/* <Flex w="100%">
                        <Input
                          borderRadius="24px"
                          placeholder="Search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <Button p="12px 24px" type="submit" borderRadius="24px">
                          Search
                        </Button>
                      </Flex> */}
                      {/*<SearchInput item="Discover" data={discoverPosts} /> */}

                      <InputGroup>
                        <Input
                          w="400px"
                          borderRadius="24px"
                          placeholder="Search"
                          {...register("searchTerm")}
                        />
                        <Divider orientation="vertical" />
                        <InputRightAddon
                          textAlign="center"
                          borderTopRightRadius="24px"
                          borderBottomRightRadius="24px"
                          type="submit"
                          as={Button}
                          bg="#fafafa"
                        >
                          <SearchIcon />
                        </InputRightAddon>
                      </InputGroup>

                      {/* {suggestions.length > 0 && (
                        <List
                          bg="white"
                          borderRadius="8px"
                          boxShadow="lg"
                          mt="2"
                          w="100%"
                          maxW="600px"
                          position="absolute"
                          zIndex="1000"
                        >
                          {suggestions.map((suggestion) => (
                            <ListItem
                              key={suggestion.id}
                              p="8px"
                              borderBottom="1px solid #e1e1e1"
                              cursor="pointer"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion.name ||
                                suggestion.postContent ||
                                suggestion.tag}
                            </ListItem>
                          ))}
                        </List>
                      )} */}
                    </form>
                  </Flex>

                  <Flex w="100%" justify="center" flexWrap="wrap">
                    {/* {userProfile && ( */}
                    <Box
                      flex="1"
                      // border="1px solid #e1e1e1" borderColor="green"
                      className="bodyWrapper__profile"
                      ml="24px"
                    >
                      <Box p="24px"></Box>
                    </Box>
                    {/* )} */}

                    <Box
                      // justify="center"
                      // align="center"
                      flex="16"
                      // borderWidth="2px" borderColor="red"
                      m="24px 24px"
                      className="bodyWrapper__contents"
                    >
                      {searchTerm && (
                        <Flex>
                          <Tabs onChange={(index) => setTabIndex(index)}>
                            <TabList>
                              <Tab>Posts</Tab>
                              <Tab>People</Tab>
                            </TabList>
                            <TabIndicator
                              mt="-1.5px"
                              height="2px"
                              bg="blue.500"
                              borderRadius="1px"
                            />
                            <TabPanels>
                              <TabPanel>
                                <Grid
                                  className="grid__discover"
                                  templateColumns={`repeat(4, 1fr)`}
                                  gap="4"
                                  autoRows="minmax(200px, auto)"
                                  rowGap={12}
                                >
                                  {filteredPosts.map((post) => (
                                    <GridItem
                                      key={post.id}
                                      // border="1px solid #e1e1e1"
                                      // p="6px"
                                      colSpan={1}
                                      rowSpan={1}
                                      onClick={() =>
                                        user
                                          ? window.open(
                                              `/discover/post/${post.id}`
                                            )
                                          : toast({
                                              title: "Oops!",
                                              description:
                                                "Please login first.",
                                              status: "error",
                                              duration: 1500,
                                              position: "top",
                                            })
                                      }
                                      maxW="250px"
                                      cursor="pointer"
                                    >
                                      <Flex justify="center" align="center">
                                        <Flex justify="center" align="center">
                                          {post.postImage && (
                                            <Image
                                              borderRadius="8"
                                              objectFit="cover"
                                              // maxWidth="300px"
                                              w="300px"
                                              h="370px"
                                              src={post.postImage}
                                              alt="Post Image"
                                            />
                                          )}

                                          {post.postVideo && (
                                            <Box position="relative">
                                              <video
                                                controls
                                                onLoadedMetadata={(e) => {
                                                  e.target.volume = 0.85;
                                                }}
                                                style={{
                                                  borderRadius: "8px",
                                                  // maxWidth:"500px",
                                                  width: "300px",
                                                  height: "370px",
                                                  objectFit: "cover",
                                                }}
                                                onMouseEnter={(e) => {
                                                  if (e.target.paused) {
                                                    e.target.play();
                                                  }
                                                }}
                                                onMouseLeave={(e) => {
                                                  e.target.pause();
                                                }}
                                                // onMouseEnter={(e) => e.target.play()}
                                                // onMouseLeave={(e) => e.target.pause()}
                                              >
                                                <source
                                                  src={post.postVideo}
                                                  type="video/mp4"
                                                />
                                                Your browser does not support
                                                the video tag.
                                              </video>
                                              {post.views !== undefined && (
                                                <Flex
                                                  align="center"
                                                  justify="center"
                                                  position="absolute"
                                                  top="1px" // Adjust as needed
                                                  right="8px" // Adjust as needed
                                                  background="rgba(0, 0, 0, 0.0)" // Optional background to make text readable
                                                  borderRadius="12px"
                                                  p="2px 8px"
                                                >
                                                  <IconButton
                                                    icon={<FaPlay />}
                                                    aria-label="Views"
                                                    variant="ghost"
                                                    colorScheme="white"
                                                    fontSize="sm"
                                                    isDisabled
                                                    background="transparent"
                                                  />
                                                  <Text
                                                    fontSize="sm"
                                                    color="white"
                                                    ml="-2"
                                                  >
                                                    {post.views}
                                                  </Text>
                                                </Flex>
                                              )}
                                            </Box>
                                          )}
                                        </Flex>
                                      </Flex>

                                      <Flex justify="space-between" mt="10px">
                                        <Flex>
                                          <Avatar
                                            size="xs"
                                            name={post.authorName}
                                            src={
                                              post.profileImage ||
                                              "/path/to/avatar.jpg"
                                            }
                                          />
                                          <Button
                                            ml="6px"
                                            fontSize="18px"
                                            variant="link"
                                            color="#333333"
                                          >
                                            {post.authorName}
                                          </Button>
                                        </Flex>
                                        <Text
                                          fontSize="xs"
                                          color="#6e6e6e"
                                          as="i"
                                        >
                                          {formatDistanceToNow(post.createdAt)}{" "}
                                          ago
                                        </Text>
                                      </Flex>
                                      <Box className="postContent">
                                        <Text
                                          as="i"
                                          className="truncate"
                                          textAlign="justify"
                                          fontSize="13px"
                                          mr="3"
                                          fontWeight="bold"
                                          // color="#6e6e6e"
                                        >
                                          {post.postContent}
                                        </Text>
                                      </Box>
                                      <Box className="postContent">
                                        <Text
                                          as="i"
                                          className="truncate"
                                          textAlign="justify"
                                          fontSize="13px"
                                          mr="3"
                                          // color="#6e6e6e"
                                        >
                                          {post.tag}
                                        </Text>
                                      </Box>
                                    </GridItem>
                                  ))}
                                </Grid>
                              </TabPanel>
                              <TabPanel>
                                {filteredUsers.map((user) => {
                                  return (
                                    <>
                                      <Card
                                        border="1px solid #f2f2f2"
                                        // _hover={{
                                        //   cursor: "pointer",
                                        //   bg: "#f2f2f2",
                                        // }}
                                        key={user.id}
                                        m="8px 0"
                                        minW="50vw"
                                      >
                                        <CardBody>
                                          <Box>
                                            <Flex align="center" gap={3}>
                                              <Avatar
                                                size="lg"
                                                name={user.name}
                                                src={
                                                  user.profileImage ||
                                                  "/path/to/avatar.jpg"
                                                }
                                              />
                                              <Button
                                                variant="link"
                                                size="lg"
                                                color="#000"
                                                onClick={() =>
                                                  handleCardClick(user.id)
                                                }
                                              >
                                                {user.name}
                                              </Button>
                                            </Flex>

                                            <Flex
                                              gap={1}
                                              m="4px 0"
                                              align="center"
                                              color="gray.500"
                                              display={
                                                !user.location ? "none" : "flex"
                                              }
                                            >
                                              <MapPin size={14} />
                                              <Text>{user.location}</Text>
                                            </Flex>
                                          </Box>
                                        </CardBody>
                                      </Card>
                                    </>
                                  );
                                })}
                              </TabPanel>
                            </TabPanels>
                          </Tabs>
                        </Flex>
                      )}
                      {!searchTerm && (
                        <Grid
                          className="grid__discover"
                          templateColumns={`repeat(4, 1fr)`}
                          gap="4"
                          autoRows="minmax(200px, auto)"
                          rowGap={12}
                        >
                          {discoverPosts &&
                            discoverPosts.map((post) => (
                              <GridItem
                                key={post.id}
                                // border="1px solid #e1e1e1"
                                // p="6px"
                                colSpan={1}
                                rowSpan={1}
                                onClick={() =>
                                  user
                                    ? window.open(`/discover/post/${post.id}`)
                                    : toast({
                                        title: "Oops!",
                                        description: "Please login first.",
                                        status: "error",
                                        duration: 1500,
                                        position: "top",
                                      })
                                }
                                maxW="250px"
                                cursor="pointer"
                              >
                                <Flex justify="center" align="center">
                                  <Flex justify="center" align="center">
                                    {post.postImage && (
                                      <Image
                                        borderRadius="8"
                                        objectFit="cover"
                                        // maxWidth="300px"
                                        w="300px"
                                        h="370px"
                                        src={post.postImage}
                                        alt="Post Image"
                                      />
                                    )}

                                    {post.postVideo && (
                                      <Box position="relative">
                                        <video
                                          controls
                                          onLoadedMetadata={(e) => {
                                            e.target.volume = 0.85;
                                          }}
                                          style={{
                                            borderRadius: "8px",
                                            // maxWidth:"500px",
                                            width: "300px",
                                            height: "370px",
                                            objectFit: "cover",
                                          }}
                                          onMouseEnter={(e) => {
                                            if (e.target.paused) {
                                              e.target.play();
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            e.target.pause();
                                          }}
                                          // onMouseEnter={(e) => e.target.play()}
                                          // onMouseLeave={(e) => e.target.pause()}
                                        >
                                          <source
                                            src={post.postVideo}
                                            type="video/mp4"
                                          />
                                          Your browser does not support the
                                          video tag.
                                        </video>
                                        {post.views !== undefined && (
                                          <Flex
                                            align="center"
                                            justify="center"
                                            position="absolute"
                                            top="1px" // Adjust as needed
                                            right="8px" // Adjust as needed
                                            background="rgba(0, 0, 0, 0.0)" // Optional background to make text readable
                                            borderRadius="12px"
                                            p="2px 8px"
                                          >
                                            <IconButton
                                              icon={<FaPlay />}
                                              aria-label="Views"
                                              variant="ghost"
                                              colorScheme="white"
                                              fontSize="sm"
                                              isDisabled
                                              background="transparent"
                                            />
                                            <Text
                                              fontSize="sm"
                                              color="white"
                                              ml="-2"
                                            >
                                              {post.views}
                                            </Text>
                                          </Flex>
                                        )}
                                      </Box>
                                    )}
                                  </Flex>
                                </Flex>

                                <Flex justify="space-between" mt="10px">
                                  <Flex>
                                    <Avatar
                                      size="xs"
                                      name={post.authorName}
                                      src={
                                        post.profileImage ||
                                        "/path/to/avatar.jpg"
                                      }
                                    />
                                    <Button
                                      ml="6px"
                                      fontSize="18px"
                                      variant="link"
                                      color="#333333"
                                    >
                                      {post.authorName}
                                    </Button>
                                  </Flex>
                                  <Text fontSize="xs" color="#6e6e6e" as="i">
                                    {formatDistanceToNow(post.createdAt)} ago
                                  </Text>
                                </Flex>
                                <Box className="postContent">
                                  <Text
                                    as="i"
                                    className="truncate"
                                    textAlign="justify"
                                    fontSize="13px"
                                    mr="3"
                                    fontWeight="bold"
                                    // color="#6e6e6e"
                                  >
                                    {post.postContent}
                                  </Text>
                                </Box>
                                <Box className="postContent">
                                  <Text
                                    as="i"
                                    className="truncate"
                                    textAlign="justify"
                                    fontSize="13px"
                                    mr="3"
                                    // color="#6e6e6e"
                                  >
                                    {post.tag}
                                  </Text>
                                </Box>
                              </GridItem>
                            ))}
                        </Grid>
                      )}
                    </Box>
                    <Box flex="1"></Box>
                  </Flex>
                </Flex>
              )}
            </Box>
          </Box>
        </Flex>

        <Footer />
      </Box>
      <PostModal isOpen={isOpen} onClose={onClose} post={selectedPost} />
    </>
  );
};
export default Discover;
