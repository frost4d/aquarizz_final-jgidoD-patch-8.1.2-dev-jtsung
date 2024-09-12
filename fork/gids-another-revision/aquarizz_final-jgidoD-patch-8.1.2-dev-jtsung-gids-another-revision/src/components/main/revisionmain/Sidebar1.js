import React from "react";
import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Link,
  Button,
  Heading,
  Divider,
  useDisclosure,
  Grid,
  GridItem,
  Image,
  Avatar,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Home, User, ShoppingBag, Edit, Users, UserPlus } from "react-feather";
import { UserAuth } from "../../context/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import AddDiscoverModal from "./AddDiscoverModal";
import { ChatIcon } from "@chakra-ui/icons";
import LoginModal from "./LoginModal";
import AddMarketplace from "./AddMarketplaceModal";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, userProfile } = UserAuth();
  const openLogin = useDisclosure();
  const addMarketplace = useDisclosure();
  const addDiscover = useDisclosure();
  const [filteredPosts, setFilteredPosts] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPost, setSelectedPost] = useState(null);

  const openPostModal = (post) => {
    setSelectedPost(post);
    onOpen();
  };

  return (
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
                      scr={userProfile.profileImage || "/path/to/avatar.jpg"}
                    />

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
                        onClick={addMarketplace.onOpen}
                      >
                        <AddDiscoverModal
                          isOpen={addMarketplace.isOpen}
                          onClose={addMarketplace.onClose}
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
                        <source src={post.postVideo} type="video/mp4" />
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
                <Box className="postContent">
                  <Text
                    as="i"
                    className="truncate"
                    textAlign="justify"
                    fontSize="13px"
                    mr="3"
                    // color="#6e6e6e"
                  >
                    {post.postContent}
                  </Text>
                </Box>
              </GridItem>
            ))}
          </Grid>
        </Flex>
        <Box flex="1"></Box>
      </Flex>

      <Flex direction="column" align="start">
        <Link
          p="2"
          mb="2"
          w="100%"
          fontWeight="bold"
          _hover={{ bg: "#f0f0f0", borderRadius: "10px" }}
          onClick={() => navigate("/following")}
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
          onClick={() => navigate("/friends")}
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
  );
};

export default Sidebar;
