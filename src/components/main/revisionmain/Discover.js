import "./Discover.css";
import { useEffect, useState } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDocs, collection, addDoc } from "firebase/firestore";
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
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import Navigation from "./Navigation";
import { Edit, Plus } from "react-feather";
import AddDiscoverModal from "./AddDiscoverModal";
import { UserAuth } from "../../context/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import Footer from "./Footer";
import PostModal from "./PostModal";
import Sidebar from "./Sidebar1";

const Discover = () => {
  const navigate = useNavigate();
  const { user, userProfile } = UserAuth();
  console.log("userProfile:", userProfile);
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
  // const letter = userProfile.name.charAt(0);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchDiscoverPosts = async () => {
      try {
        const postsCollection = collection(db, "discover");
        const querySnapshot = await getDocs(postsCollection);
        const tempPosts = [];
        querySnapshot.forEach((doc) => {
          tempPosts.push({ id: doc.id, ...doc.data() });
        });
        setDiscoverPosts(tempPosts);
        setFilteredPosts(tempPosts);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchDiscoverPosts();
  }, [userProfile]);
  console.log("userProfile:", userProfile);

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

      const filteredPosts = discoverPosts.filter((post) =>
        // post.authorName?.toLowerCase().startsWith(searchTermLower) ||
        post.tag?.toLowerCase().startsWith(searchTermLower) ||
        post.postTitle?.toLowerCase().startsWith(searchTermLower) ||
        post.postContent?.toLowerCase().startsWith(searchTermLower)
      );

      // Combine and show top 5 suggestions with separation
      setSuggestions([
        ...filteredUsers.slice(0, 5).map(user => ({ ...user, type: 'user' })),
        ...filteredPosts.slice(0, 5).map(post => ({ ...post, type: 'post' }))
      ]);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, discoverPosts, users]);

  const handleSearchDiscover = (e) => {
    e.preventDefault();
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = discoverPosts.filter((post) => {
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
    if (suggestion.type === 'user') {
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
  // const handleAddDiscover = (formData) => {
  //   // Add logic to save the form data to your database or state
  //   console.log(formData);
  //   const docRef = addDoc(collection(db, "discover"), formData);
  //   // For example, you can update the discoverPosts state with the new data
  //   setDiscoverPosts([...discoverPosts, formData]);
  //   // setDiscoverPosts([...discoverPosts, { id: docRef.id, ...formData }]);
  //   // setFilteredPosts([...discoverPosts, { id: docRef.id, ...formData }]);
  //   addDiscover.onClose(); // Close the modal after submitting
  //   toast({
  //     title: "Post Created.",
  //     description: "Post successfully published.",
  //     status: "success",
  //     duration: 5000,
  //     position: "top",
  //   });
  // };

  // useEffect(() => {
  //   const showPosts = async () => {
  //     if (!postId) {
  //       // Handle the case where postId is undefined
  //       return;
  //     }
  //     const docRef = doc(db, "discover", postId);
  //     const docSnap = await getDoc(docRef);
  //     const tempVar = [];
  //     if (docSnap.exists()) {
  //       tempVar.push(docSnap.data());
  //     }
  //     setPost(tempVar);
  //   };
  //   showPosts();
  // }, [postId]);
  console.log(discoverPosts);
  console.log(userProfile);
  return (
    <>
      <Box h="100vh" overflowY="auto">
      <Navigation cartItemCount={cartItemCount} setCartItemCount={setCartItemCount}/>
     <Flex>
      <Sidebar/>
      <Box flex="1" pl="2px">
            <Flex justify="space-between" p="0 86px 0px 64px">
              <Heading>Discover</Heading>
              {/* <Flex display={user ? "flex" : "none"} justify="space-between">
              <Button
                  mr="12px"
                  variant="ghost"
                  leftIcon={<Plus size={16} />}
                  onClick={addDiscover.onOpen}
                >
                  <AddDiscoverModal
                    isOpen={addDiscover.isOpen}
                    onClose={addDiscover.onClose}
                  />
                  Create
                </Button>
                <Button variant="link" color="#333333">
                  My Shop
                </Button>
              </Flex> */}
            </Flex>

            <Box mb="12"
            // p="24px"
            //  borderWidth="2px" borderColor="blue"
             >
              <Flex
                gap="24px 24px"
                flexWrap="wrap"
                justify="space-evenly"
                align="center"
                mt="32px"
              >
                <Flex w="100%" justify="center" p="12px 24px">
                  <form onSubmit={handleSearchDiscover}>
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
                          { suggestion.name || suggestion.postContent || suggestion.tag }
                        </ListItem>
                      ))}
                    </List>
                  )}
                  </form>
                </Flex>

            <Flex
              w="100%"
              gap="24px 12px"
              justify="center"
              align="start"
              flexWrap="wrap"
            >
              {/* {userProfile && ( */}
              {/* <Box
                flex="1"
                // border="1px solid #e1e1e1" borderColor="green"
                className="bodyWrapper__profile"
                ml="24px"
              >

                    <Box p="24px">
                      <Flex
                        className="userprofile__wrapper__discover"
                        flexDirection="column"
                        justify="center"
                        align="center"
                      >
                        {!userProfile ? (

                      <Button
                        border="1px solid #e1e1e1"
                        borderColor="green"
                        variant="link"
                        onClick={() => {
                          navigate("/");
                        }}
                        color="#000"
                      >
                        Please login first.
                      </Button>
                    ) : (
                      userProfile && (
                        <Flex justify="center" align="center" p="24px">
                          <Avatar
                            size="xl"
                            name={userProfile.name}
                            scr={
                              userProfile.profileImage || "/path/to/avatar.jpg"
                            }
                          />
                        </Flex>
                      )
                    )}

                    <Heading size="md">
                      {!user ? "" : userProfile && userProfile.name}
                    </Heading>
                    <Text fontSize="xs">
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
                        onClick={addDiscover.onOpen}
                      >
                        <AddDiscoverModal
                          isOpen={addDiscover.isOpen}
                          onClose={addDiscover.onClose}
                        />
                        New Post
                      </Button>

                    </Box>
                      </Flex>
                    </Box>
                  </Box> */}
                  {/* )} */}
                  
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

                    {filteredPosts.map((post) => (
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
                              {formatDistanceToNow(post.createdAt)} ago
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
                      ))}
                    </Grid>
                  </Flex>
                  <Box flex="1"></Box>
                </Flex>
          </Flex>
        </Box>
        <Footer />
        </Box>
        </Flex>
      </Box>
      <PostModal isOpen={isOpen} onClose={onClose} post={selectedPost} />
    </>
  );
};
export default Discover;
