import { Search2Icon } from "@chakra-ui/icons";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Input,
  useDisclosure,
  Text,
  Box,
  Flex,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabIndicator,
  Card,
  CardBody,
  CardHeader,
  ModalCloseButton,
  ModalHeader,
  ModalFooter,
  Heading,
  Image,
  Avatar,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { db } from "../../../../firebase/firebaseConfig";
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
import { useNavigate } from "react-router-dom";
import { UserAuth } from "../../../context/AuthContext";
import LoginModal from "../LoginModal";

const SearchInput = (props) => {
  const { user } = UserAuth();
  const marketData = props.data;
  const searchModal = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");
  const [marketPost, setMarketPost] = useState();
  const [searchChange, setSearchChange] = useState();
  const [searchUser, setSearchUser] = useState();
  const [filteredPosts, setFilteredPosts] = useState();
  const [filteredUser, setFilteredUser] = useState();
  const [tabIndex, setTabIndex] = useState(0);
  const [users, setUsers] = useState();
  const [loading, setLoading] = useState();
  const navigate = useNavigate();
  const openLogin = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // useEffect(() => {
  //   const fetchProfilePicture = () => {};

  //   fetchProfilePicture();
  // });

  // fetch posts in marketplace
  useEffect(() => {
    const fetchDiscoverPosts = async () => {
      setLoading(true);
      try {
        const postsCollection = collection(db, "market");
        const querySnapshot = await getDocs(postsCollection);
        const tempPosts = [];
        querySnapshot.forEach((doc) => {
          tempPosts.push({ id: doc.id, ...doc.data() });
        });
        setMarketPost(tempPosts);
        // setFilteredPosts(tempPosts);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchDiscoverPosts();
  }, []);

  const handleCardClick = (data) => {
    if (props.item === "Marketplace") {
      window.open(`/marketplace/item/${data}`, "_blank", "noopener,noreferrer");
    } else if (props.item === "Discover") {
      window.open(`/discover/post/${data}`, "_blank", "noopener,noreferrer");
    }
    console.log(data);
  };
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
  const handleSearchChangePeople = (e) => {
    const input = e.target.value.toLowerCase();
    setSearchUser(input);

    if (input) {
      const filteredData = users.filter((item) => {
        return item.name.toLowerCase().includes(input);
        //  || item.authorName.toLowerCase().includes(input)
      });

      setFilteredUser(filteredData);
    } else {
      setFilteredUser([]);
    }
  };

  const handleSearchChangePost = (e) => {
    const input = e.target.value.toLowerCase();
    setSearchChange(input);

    if (input) {
      const filteredData = marketData.filter((item) => {
        return (
          item.postContent.toLowerCase().includes(input) ||
          item.postTitle.toLowerCase().includes(input)
        );
      });

      setFilteredPosts(filteredData);
    } else {
      setFilteredPosts([]);
    }
  };
  return (
    <>
      <Flex
        w="25em"
        color="gray.500"
        align="center"
        p="6px 12px"
        // justify="space-around"
        cursor="pointer"
        border="1px solid #e1e1e1"
        borderRadius="6px"
        boxShadow="0px 1px 3px #e1e1e1"
        onClick={() => {
          !user ? openLogin.onOpen() : searchModal.onOpen();
        }}
        gap={3}
      >
        <Search2Icon />
        <Text>Search {props.item}</Text>
      </Flex>
      <LoginModal isOpen={openLogin.isOpen} onClose={openLogin.onClose} />
      <Modal
        size="xl"
        scrollBehavior="inside"
        isOpen={searchModal.isOpen}
        onClose={searchModal.onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader></ModalHeader>
          <ModalBody>
            <Box>
              <Box>
                <Input
                  value={tabIndex === 0 ? searchChange || "" : searchUser || ""}
                  placeholder={`Search ${props.item}`}
                  onChange={
                    tabIndex === 0
                      ? handleSearchChangePost
                      : handleSearchChangePeople
                  }
                />
              </Box>
              <Box>
                <Tabs
                  onChange={(index) => setTabIndex(index)}
                  mt="12px"
                  isFitted
                  variant="unstyled"
                >
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
                      {filteredPosts &&
                        filteredPosts.length > 0 &&
                        filteredPosts.map((data) => {
                          return (
                            <>
                              <Card
                                onClick={() => handleCardClick(data.id)}
                                border="1px solid #f2f2f2"
                                _hover={{ cursor: "pointer", bg: "#f2f2f2" }}
                                key={data.id}
                                m="8px 0"
                              >
                                <CardBody>
                                  <Flex justify="space-between">
                                    <Box>
                                      <Flex align="center" gap={2}>
                                        <Avatar
                                          size="xs"
                                          name={data.authorName}
                                          src={
                                            data.profileImage ||
                                            "/path/to/avatar.jpg"
                                          }
                                        />
                                        <Heading size="sm" color="#191919">
                                          {data.authorName}
                                        </Heading>
                                      </Flex>
                                      <Box m="2px 8px">
                                        <Text fontWeight="500" fontSize="sm">
                                          {props.item === "Marketplace"
                                            ? ""
                                            : data.postTitle}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          {data.postContent}
                                        </Text>
                                      </Box>
                                    </Box>

                                    <Box overflow="hidden">
                                      {!data.postImage ? (
                                        ""
                                      ) : (
                                        <Image
                                          className="item__image"
                                          objectFit="cover"
                                          // maxWidth="300px"
                                          w="60px"
                                          h="60px"
                                          src={
                                            data.postImage ? data.postImage : ""
                                          }
                                        />
                                      )}
                                    </Box>
                                  </Flex>
                                </CardBody>
                              </Card>
                            </>
                          );
                        })}
                    </TabPanel>
                    <TabPanel>
                      {filteredUser &&
                        filteredUser.length > 0 &&
                        filteredUser.map((data) => {
                          return (
                            <>
                              <Card
                                onClick={() => navigate(`/profile/${data.id}`)}
                                border="1px solid #f2f2f2"
                                _hover={{ cursor: "pointer", bg: "#f2f2f2" }}
                                key={data.id}
                                m="8px 0"
                              >
                                <CardBody>
                                  <Flex justify="space-between">
                                    <Box>
                                      <Flex align="center" gap={2}>
                                        <Avatar
                                          size="md"
                                          name={data.name}
                                          src={
                                            data.profileImage ||
                                            "/path/to/avatar.jpg"
                                          }
                                        />
                                        <Box>
                                          <Heading size="sm" color="#191919">
                                            {data.name}
                                          </Heading>
                                          <Flex align="center">
                                            <Text
                                              fontSize="sm"
                                              color="gray.500"
                                            >
                                              {!data.location
                                                ? ""
                                                : `Lives around ${data.location}`}
                                            </Text>
                                          </Flex>
                                        </Box>
                                      </Flex>
                                    </Box>

                                    {/* <Box overflow="hidden">
                                      {!data.postImage ? (
                                        ""
                                      ) : (
                                        <Image
                                          className="item__image"
                                          objectFit="cover"
                                          // maxWidth="300px"
                                          w="60px"
                                          h="60px"
                                          src={
                                            data.postImage ? data.postImage : ""
                                          }
                                        />
                                      )}
                                    </Box> */}
                                  </Flex>
                                </CardBody>
                              </Card>
                            </>
                          );
                        })}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SearchInput;