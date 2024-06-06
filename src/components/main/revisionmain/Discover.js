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
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import Navigation from "./Navigation";
import { Plus } from "react-feather";
import AddDiscoverModal from "./AddDiscoverModal";
import { UserAuth } from "../../context/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import Footer from "./Footer";
const Discover = () => {
  const { user, userProfile } = UserAuth();
  const primaryColor = "#FFC947";
  const primaryFont = '"Poppins", sans-serif';
  const tertiaryColor = "#6e6e6e";
  const addDiscover = useDisclosure();
  const toast = useToast();
  const [discoverPosts, setDiscoverPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [post, setPost] = useState();
  const { postId, userId } = useParams();
  const letter = userProfile.name.charAt(0);

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
      } catch (err) {
        console.log(err.message);
      }

      
      setFilteredPosts(tempPosts);

    };
    fetchDiscoverPosts();
  }, []);

  const handleSearchDiscover = (e) => {
    e.preventDefault();
    const filtered = discoverPosts.filter((post) =>
      post.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  };

  const handleAddDiscover = (formData) => {
    // Add logic to save the form data to your database or state
    console.log(formData);
    const docRef = addDoc(collection(db, "discover"), formData);
    // For example, you can update the discoverPosts state with the new data
    setDiscoverPosts([...discoverPosts, formData]);
    // setDiscoverPosts([...discoverPosts, { id: docRef.id, ...formData }]);
    // setFilteredPosts([...discoverPosts, { id: docRef.id, ...formData }]);
    addDiscover.onClose(); // Close the modal after submitting
    toast({
      title: "Post Created.",
      description: "Post successfully published.",
      status: "success",
      duration: 5000,
      position: "top",
    });
  };

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
        <Navigation />
        <Flex justify="space-between" p="0 86px 0px 64px">
          <Heading>Discover</Heading>
          <Flex display={user ? "flex" : "none"} justify="space-between">
            {/* <Button
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
            </Button> */}
            <Button variant="link" color="#333333">
              My Shop
            </Button>
          </Flex>
        </Flex>

        <Box p="24px">
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
                  <Input borderRadius="24px" placeholder="Search" value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} />
                  <Button p="12px 24px" type="submit" borderRadius="24px">
                    Search
                  </Button>
                </Flex>
              </form>
            </Flex>
            <Flex
              w="100%"
              gap="24px 12px"
              justify="center"
              align="start"
              flexWrap="wrap"
            >

              <Box flex="1" border="1px solid #e1e1e1">
                <Box p="24px">
                  <Flex flexDirection="column" justify="center" align="center">
                    <Flex
                      justify="center"
                      align="center"
                      borderRadius="50%"
                      h="100px"
                      w="100px"
                      bg="#FF7D29"
                      p="24px"
                    >
                      <Heading size="lg">{letter.toUpperCase()}</Heading>
                    </Flex>
                    <Heading size="md">{userProfile.name}</Heading>
                    <Text fontSize="xs">
                      User since:
                      {format(userProfile.dateCreated, "yyyy-MM-HH")}
                    </Text>
                  </Flex>
                </Box>
              </Box>
              <Box flex="3">
                <Grid
                  templateColumns={`repeat(3, 1fr)`}
                  gap="8"
                  autoRows="minmax(200px, auto)"
                  rowGap={12}
                >
                  {discoverPosts.map((post) => (
                    <GridItem
                      key={post.id}
                      border="1px solid #e1e1e1"
                      p="6px"
                      colSpan={1}
                      rowSpan={1}
                    >
                      <Flex>
                        <Box w="100%">
                          <Image
                            objectFit="cover"
                            w="100%"
                            h="350px"
                            src={post.postImage}
                            alt="Post Image"
                          />
                        </Box>
                      </Flex>
                      <Flex justify="space-between" mt="24px">
                        <Button variant="link" color="#333333">
                          {post.authorName}
                        </Button>
                        <Text fontSize="xs" color="#6e6e6e" as="i">
                          {formatDistanceToNow(post.createdAt)} ago
                        </Text>
                      </Flex>
                      <Box mt="12px">
                        <Text fontSize="sm" color="#6e6e6e">
                          {post.postContent}
                        </Text>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
              <Box flex="1"></Box>

            </Flex>
          </Flex>
        </Box>
        <Footer />
      </Box>
    </>
  );
};
export default Discover;
