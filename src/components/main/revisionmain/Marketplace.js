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
  Image
} from "@chakra-ui/react";
import "./Marketplace.css";
import { Edit, Plus } from "react-feather";

import Navigation from "./Navigation";
import { useEffect, useState } from "react";
import { doc, getDocs, collection, addDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { UserAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import Footer from "./Footer";
import AddMarketplace from "./AddMarketplaceModal";
import LoginModal from "./LoginModal";
import Sidebar from "./Sidebar1";

const Marketplace = () => {
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState(null);

  //   get the contents of the posts posted in marketplace db
  useEffect(() => {
  const fetchMarketplace = async () => {
    setLoading();
    try {
      const postsCollection = collection(db, "marketplace");
      const querySnapshot = await getDocs(postsCollection);
      const tempPosts = [];
      querySnapshot.forEach((doc) => {
        tempPosts.push({ id: doc.id, ...doc.data() });
      });
      setMarketplacePost(tempPosts);
      setFilteredPosts(tempPosts);
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
    onOpen();
  };

  console.log(marketplacePost);
  console.log(filteredPosts);

  return (
    <>
      <Navigation />
      <Flex>
      <Sidebar/>
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
                <Flex>
                  <Flex w="100%" justify="center" p="12px 24px">
                    <form onSubmit={handleSearchMarketplace}>
                      <Flex w="100%" justify="space-between">
                        <Input
                          borderRadius="24px"
                          placeholder="Search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        <Button p="12px 24px" type="submit" borderRadius="24px">
                          Search
                        </Button>
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
                              onClick={() => handleSuggestionClick(suggestion)}
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
                </Flex>
              </form>
            </Flex>

            <Flex w="100%" justify="center" flexWrap="wrap">
              {/* user side */}
              {/* <Flex justify="center" textAlign="center" flex="1">
                {!userProfile ? (
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
                  <Flex
                    justify="center"
                    align="center"
                    p="24px"
                    flexDirection="column"
                  >
                    <Avatar
                      size="xl"
                      name={userProfile.name}
                      scr={userProfile.profileImage || "/path/to/avatar.jpg"}
                    />
                    <Heading size="md">
                      {userProfile && userProfile.name}
                    </Heading>
                    <Text fontSize="xs">
                      {userProfile &&
                        `User since: ${format(userProfile.dateCreated, "yyyy-MM-HH")}`}
                    </Text>
                    <Divider m="12px 0" />
                    <Box>
                      <Button
                        variant="outline"
                        w="100%"
                        mr="12px"
                        rightIcon={<Edit size={16} />}
                        onClick={addMarketplace.onOpen}
                      >
                        <AddMarketplace
                          isOpen={addMarketplace.isOpen}
                          onClose={addMarketplace.onClose}
                        />
                        New Post
                      </Button>
                    </Box>
                  </Flex>
                )}
              </Flex> */}

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
                      templateColumns={`repeat(4, 1fr)`}
                      gap="4"
                      autoRows="minmax(200px, auto)"
                      rowGap={12}
                    >
{Array.isArray(filteredPosts) && filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <GridItem
                          key={post.id}
                          // border="1px solid #e1e1e1"
                          // p="6px"
                          colSpan={1}
                          rowSpan={1}
                          onClick={() => openPostModal(post)}
                          maxW="250px"
                      cursor="pointer"
                        >
                          <Flex justify='center' align="center"  >
                            <Flex justify='center' align="center"  >
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
                                <video
                                  controls
                                  onLoadedMetadata={(e) => {
                                    e.target.volume = 0.85
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
                          </Flex>
                         
                          <Flex justify="space-between" mt="10px">
                            <Button fontSize="18px" variant="link" color="#333333"> 
                              {post.authorName}
                            </Button>
                            <Text fontSize="xs" color="#6e6e6e" as="i">
                            {formatDistanceToNow(new Date(post.createdAt))} ago
                            </Text>
                          </Flex>
                          <Box className="postContent" >
                            <Text as="i" className="truncate" textAlign="justify" fontSize="13px" mr="3" 
                            // color="#6e6e6e"
                            >
                              {post.postContent}
                            </Text>
                          </Box>
                          {/* <Box mt="12px">
                            <Text className="truncate" textAlign="justify" fontSize="sm" color="#6e6e6e">
                              {post.postContent}
                            </Text>
                          </Box> */}
                        </GridItem>
                      ))
                    ) : (
                      <Text>No posts found</Text>
                    )}
                    </Grid>
                  </Flex>
            </Flex>
          </>
        )}
      </Box>
      <Footer />
      </Box>
      </Flex>
    </>
  );
};
export default Marketplace;