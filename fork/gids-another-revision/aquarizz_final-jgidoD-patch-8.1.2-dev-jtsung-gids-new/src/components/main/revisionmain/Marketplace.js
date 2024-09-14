import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Text,
  Input,
  useDisclosure,
  List,
  ListItem,
  Grid,
  GridItem,
  Image,
  Modal,
  ModalOverlay,
  ModalBody,
  Link,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import "./Marketplace.css";
import { Edit, Plus, Users, UserPlus } from "react-feather";
import Navigation from "./Navigation";
import { useEffect, useState } from "react";
import { doc, getDocs, collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { UserAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import Footer from "./Footer";
import AddMarketplaceModal from "./AddMarketplaceModal";
import LoginModal from "./LoginModal";
import Sidebar from "./Sidebar1";
import MarketItem from "./MarketItem";
import { ChatIcon } from "@chakra-ui/icons";
import SearchInput from "./components/SearchInput";

const Marketplace = () => {
  const primaryColor = "#FFC947";
  const toast = useToast();
  const navigate = useNavigate();
  const { user, userProfile } = UserAuth();
  const [loading, setLoading] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState();
  const [users, setUsers] = useState([]);
  const addMarketplace = useDisclosure();
  const openLogin = useDisclosure();
  const [marketplacePost, setMarketplacePost] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { itemModal } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState(null);
  const [discoverPosts, setDiscoverPosts] = useState([]);
  const [friends, setFriends] = useState([]);

  //   get the contents of the posts posted in marketplace db
  useEffect(() => {
    const fetchMarketplace = async () => {
      setLoading(true);

      try {
        const postsCollection = collection(db, "marketplace");
        const querySnapshot = await getDocs(postsCollection);
        const tempPosts = [];
        querySnapshot.forEach((doc) => {
          tempPosts.push({ id: doc.id, ...doc.data() });
        });
        setMarketplacePost(tempPosts);
        setFilteredPosts(tempPosts);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchMarketplace();
  }, [userProfile]);

  //check and get if user is logged in
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
  console.log(userProfile);

  useEffect(() => {
    console.log("Marketplace Posts Loaded:", marketplacePost);
    console.log("Filtered Posts:", filteredPosts);
  }, [marketplacePost, filteredPosts]);

  useEffect(() => {
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();

      // Filter users and posts separately
      const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().startsWith(searchTermLower)
      );

      const filteredPosts = marketplacePost.filter(
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
  }, [searchTerm, marketplacePost, users]);

  const handleSearchMarketplace = (e) => {
    e.preventDefault();

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = marketplacePost.filter((post) => {
      return (
        // post.authorName?.toLowerCase().includes(searchTermLower) ||
        post.tag?.toLowerCase().includes(searchTermLower) ||
        post.postTitle?.toLowerCase().includes(searchTermLower) ||
        post.postContent?.toLowerCase().includes(searchTermLower)
      );
    });

    setFilteredPosts(filtered);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === "user") {
      navigate(`/profile/${suggestion.id}`);
    } else {
      setSearchTerm(suggestion.postContent || suggestion.tag);
    }
    setSuggestions([]);
    setFilteredPosts([suggestion]);
  };

  const openPostModal = (post) => {
    setSelectedPost(post);
  };

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

  console.log(marketplacePost);
  console.log(filteredPosts);
  return (
    <>
      <Navigation isLoading={loading} />
      <Flex>
        {/* <Sidebar /> */}
        <Box>
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
                              userProfile.profileImage || "/path/to/avatar.jpg"
                            }
                          />

                          <Text fontSize="xs" mt="4px">
                            {!userProfile
                              ? ""
                              : userProfile &&
                                ` User since: ${format(
                                  userProfile.dateCreated,
                                  "yyyy-MM-HH"
                                )}`}
                          </Text>
                          <Divider m="12px 0" />
                          <Box>
                            <Button
                              variant="outline"
                              w="100%"
                              mr="12px"
                              // variant="ghost"
                              rightIcon={<Edit size={16} />}
                              onClick={addMarketplace.onOpen}
                              bg={primaryColor}
                              _hover={{ bg: "#ffd97e" }}
                            >
                              <AddMarketplaceModal
                                isOpen={addMarketplace.isOpen}
                                onClose={addMarketplace.onClose}
                              />
                              New Listing
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

            <Flex
              display={user ? "flex" : "none"}
              direction="column"
              align="start"
            >
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
        <Box flex="1" pl="2px">
          <Box p="0 86px 0px 64px">
            <Heading>Marketplace</Heading>
          </Box>
          <Box h="100vh">
            {loading ? (
              <Flex w="100%" h="100vh" align="center" justify="center">
                <span className="loader"></span>
              </Flex>
            ) : (
              <>
                <Flex justify="center">
                  <form>
                    <Flex w="100%" justify="center" p="12px 24px">
                      <form onSubmit={handleSearchMarketplace}>
                        <Flex w="100%" justify="space-between">
                          {/* <Input
                            borderRadius="24px"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />

                          <Button
                            p="12px 24px"
                            type="submit"
                            borderRadius="24px"
                          >
                            Search
                          </Button> */}
                          <SearchInput
                            item="marketplace"
                            data={marketplacePost}
                          />
                        </Flex>
                        {suggestions.length > 0 && (
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
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                              >
                                {suggestion.name ||
                                  suggestion.postContent ||
                                  suggestion.tag}
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </form>
                    </Flex>
                  </form>
                </Flex>

                <Flex w="100%" justify="center" flexWrap="wrap">
                  <Flex
                    justify="center"
                    align="center"
                    flex="16"
                    // borderWidth="2px" borderColor="red"
                    m="24px 24px"
                    className="bodyWrapper__contents"
                  >
                    <Grid
                      className="grid__discover"
                      templateColumns={`repeat(6, 1fr)`}
                      gap="4"
                      autoRows="minmax(200px, auto)"
                      rowGap={12}
                    >
                      {filteredPosts && filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                          <GridItem
                            className="item__wrapper"
                            overflow="hidden"
                            border="1px solid #E9EFEC"
                            borderRadius="12px"
                            key={post.id}
                            colSpan={1}
                            rowSpan={1}
                            onClick={() => {
                              user
                                ? window.open(
                                    `/marketplace/item/${post.id}`,
                                    "_blank",
                                    "noopener,noreferrer"
                                  )
                                : toast({
                                    title: "Oops!",
                                    description: "Please login first.",
                                    status: "error",
                                    duration: 1500,
                                    position: "top",
                                  });
                            }}
                            maxW="250px"
                            cursor="pointer"
                          >
                            <Flex justify="center" align="center">
                              {post.postImage && (
                                <Box overflow="hidden">
                                  <Image
                                    className="item__image"
                                    objectFit="cover"
                                    // maxWidth="300px"
                                    w="300px"
                                    h="300px"
                                    src={post.postImage}
                                    alt="Post Image"
                                  />
                                </Box>
                              )}

                              {post.postVideo && (
                                <video
                                  controls
                                  onLoadedMetadata={(e) => {
                                    e.target.volume = 0.75;
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
                                  Your browser does not support the video tag.
                                </video>
                              )}
                            </Flex>
                            <Flex p="8px 16px 0 " justify="space-between">
                              <Text
                                fontWeight="600"
                                color="#333333"
                                fontSize="lg"
                              >
                                {post.postTitle}
                              </Text>
                              <Text fontSize="xs" color="#6e6e6e" as="i">
                                {formatDistanceToNow(new Date(post.createdAt))}
                                ago
                              </Text>
                            </Flex>
                            <Box p="0 16px 0" className="postContent">
                              <Text
                                className="truncate"
                                textAlign="justify"
                                fontSize="xs"
                                mr="3"
                                color="#6e6e6e"
                              >
                                {post.postContent}
                              </Text>
                            </Box>
                            <Flex p="0 16px 12px" justify="space-between">
                              <Text
                                fontSize="md"
                                fontWeight="600"
                                color="#333333"
                              >
                                &#8369;{post.price}
                              </Text>
                            </Flex>
                          </GridItem>
                        ))
                      ) : (
                        <GridItem colSpan={3} justify="center" w="100%">
                          <Heading size="sm">It feels lonely here ...</Heading>
                        </GridItem>
                      )}
                    </Grid>
                  </Flex>
                </Flex>
              </>
            )}
          </Box>
        </Box>
      </Flex>
      <Footer />
    </>
  );
};
export default Marketplace;
