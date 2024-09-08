import "./ItemModal.css";
import {
  FaHeart,
  FaComment,
  FaShare,
  FaChevronRight,
  FaChevronLeft,
  FaChevronUp,
  FaChevronDown,
  FaLink,
  FaRetweet,
} from "react-icons/fa";
import {
  Box,
  CheckboxGroup,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  Text,
  Image,
  Heading,
  Button,
  Avatar,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import MarketItem from "./MarketItem";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth, storage } from "./../../../firebase/firebaseConfig";
import { useLocation } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";

import {
  collection,
  getDocs,
  doc,
  query,
  where,
  updateDoc,
  getDoc,
  onSnapshot,
  setDoc,
  deleteDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { Mail } from "react-feather";
import { UserAuth } from "../../context/AuthContext";
import { UserPlus, UserCheck, Edit3 } from "react-feather";
const ItemModal = () => {
  const toast = useToast();
  const { userId, post } = useParams();
  const { user } = UserAuth();
  const primaryColor = "#FFC947";
  const [isLoading, setIsLoading] = useState();
  const [postData, setPostData] = useState();
  const { postId } = useParams();
  const modalContainer = useDisclosure();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [likes, setLikes] = useState(post?.likes?.length || 0);
  const [shares, setShares] = useState(post?.shares?.length || 0);
  const [isLiked, setIsLiked] = useState(
    post?.likes?.includes(user?.uid) || false
  );
  //   const location = useLocation();
  //   let history = useHistory();
  const handleLike = async () => {
    if (!user || !post || !post.id) return;
    const postRef = doc(db, "discover", post.id);

    if (!isLiked) {
      await updateDoc(postRef, {
        likes: arrayUnion(user.uid),
      });
      setLikes(likes + 1);

      if (post.authorID && post.authorID !== user.uid) {
        const notificationRef = collection(
          db,
          "users1",
          post.authorID,
          "notifications"
        );
        await addDoc(notificationRef, {
          message: `${user.displayName || "Someone"} liked your post.`,
          timestamp: new Date(),
          read: false,
        });
      }
    } else {
      await updateDoc(postRef, {
        likes: arrayRemove(user.uid),
      });
      setLikes(likes - 1);
    }
    setIsLiked(!isLiked);
  };

  const handleRepost = async () => {
    if (!user || !post || !post.id) return;

    // Repost by creating a new post under the user's profile with a reference to the original post
    const newPost = {
      ...post,
      originalPostId: post.id,
      authorId: user.uid,
      authorName: user.displayName || "Unknown",
      repostedAt: new Date(),
    };

    await addDoc(collection(db, "users1", user.uid, "reposts"), newPost);

    // Increment share count only when reposting
    const postRef = doc(db, "discover", post.id);
    await updateDoc(postRef, {
      shares: arrayUnion(user.uid),
    });

    setShares((prevShares) => prevShares + 1);

    // Send repost notification to the original post author, if they are not the one reposting
    if (post.authorID && post.authorID !== user.uid) {
      const notificationRef = collection(
        db,
        "users1",
        post.authorID,
        "notifications"
      );
      await addDoc(notificationRef, {
        message: `${user.displayName || "Someone"} reposted your post.`,
        timestamp: new Date(),
        read: false,
      });
    }

    toast({
      title: "Post Reposted!",
      description: "The post has been successfully reposted.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/discover/${post.id}`;

    // Log URL to ensure it's correct
    console.log("Copying URL:", postUrl);

    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        toast({
          title: "Link Copied!",
          description: "The post URL has been copied to your clipboard.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        toast({
          title: "Copy Failed!",
          description: "Failed to copy the link. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    if (!userId || !user) return;

    // Check if the current user is following the profile's user
    const checkIfFollowing = async () => {
      const docRef = doc(db, `users1/${user.uid}/following`, userId);
      const docSnap = await getDoc(docRef);
      setIsFollowing(docSnap.exists());
    };

    checkIfFollowing();
  }, [userId, user]);

  const handleFollow = async () => {
    if (!userId || !user) return;

    try {
      // Add to followers subcollection of the user being followed
      await setDoc(doc(db, `users1/${userId}/followers`, user.uid), {
        followerId: user.uid,
        followedAt: new Date(),
      });

      // Add to following subcollection of the current user
      await setDoc(doc(db, `users1/${user.uid}/following`, userId), {
        followedUserId: userId,
        followedAt: new Date(),
      });

      setIsFollowing(true);
      // setFollowersCount((prevCount) => prevCount + 1); // Update followers count in UI
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Unfollow a user
  const handleUnfollow = async () => {
    if (!userId || !user) return;

    try {
      // Remove from followers subcollection
      await deleteDoc(doc(db, `users1/${userId}/followers`, user.uid));

      // Remove from following subcollection
      await deleteDoc(doc(db, `users1/${user.uid}/following`, userId));

      setIsFollowing(false);
      // setFollowersCount((prevCount) => prevCount - 1); // Update followers count in UI
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const isOwnProfile = userId === user?.uid;

  useEffect(() => {
    modalContainer.onOpen();
  }, []);

  const handleCloseModal = () => {
    modalContainer.onClose();
    navigate(-1);
  };

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "marketplace", postId);
        const docSnap = await getDoc(docRef);

        // Check if the document exists and get the data
        if (docSnap.exists()) {
          const itemData = docSnap.data();
          setPostData(itemData);
        }
      } catch (err) {
        console.log(err.message);
      } finally {
        // do something
      }
    };

    fetchItem();
  }, [postId]);

  const handleAuthorClick = () => {
    if (postData.authorID) {
      navigate(`/profile/${postData.authorID}`);
    }
  };

  console.log(postId);
  console.log(postData);
  return (
    <>
      <Modal
        size="full"
        isOpen={modalContainer.isOpen}
        onClose={handleCloseModal}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            {isLoading ? (
              <span className="loader"></span>
            ) : (
              postData && (
                <Flex h="100vh" justify="space-between">
                  <Flex
                    bg="#28282B"
                    flex="1"
                    justify="center"
                    className="imageWrapper__market"
                  >
                    <Box className="image__market__bg" textAlign="center">
                      <Image
                        h="100%"
                        objectFit="cover"
                        src={postData.postImage}
                        alt={postData.title}
                      />
                    </Box>
                    <Box className="image__market__bg"></Box>
                  </Flex>
                  <Box w="100%" color="#000401" flex=".4" p="16px 8px">
                    <Flex
                      align="start"
                      w="100%"
                      className="header__item__wrapper"
                      flexDirection="column"
                    >
                      <Heading size="2xl" m="4px">
                        {postData.postTitle}
                      </Heading>
                      <Text fontWeight="500" fontSize="xl" m="4px">
                        &#8369;{postData.price}
                      </Text>
                      <Text fontSize="xs" color="#6e6e6e" as="i" m="4px">
                        {formatDistanceToNow(new Date(postData.createdAt))}
                        ago
                      </Text>
                      <Flex minW="410px">
                      <Button
                        m="8px 0"
                        textAlign="center"
                        bg={primaryColor}
                        w="100%"
                        rightIcon={<Mail size={18} />}
                        onClick={() => navigate("/chatMessage/:userId")}
                      >
                        Message
                      </Button>
                      <Flex
                        // mb="2"
                        flexDirection="row"
                        alignItems="center"
                        w="35%"
                        justifyContent="end"
                        // borderTopWidth="2px"
                        borderColor="black"
                      >
                        <Flex alignItems="center" flexDirection="column">
                          <IconButton
                            mx="1"
                            icon={<FaHeart />}
                            aria-label="Like"
                            color={isLiked ? "red.500" : "Black"}
                            bg="#adb5bd"
                            onClick={handleLike}
                            _hover={{ bg: "none" }}
                          />
                          {/* <Text color="Black" fontSize="lg">
                            {likes}
                          </Text> */}
                        </Flex>
                        <Flex alignItems="center" flexDirection="column">
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              mx="1"
                              icon={<FaShare />}
                              aria-label="Share"
                              color="Black"
                              bg="#adb5bd"
                              _hover={{ bg: "none" }}
                              // onClick={handleAddShare}
                            />
                            <MenuList bg="#232323" borderColor="gray.700">
                              <MenuItem
                                icon={<FaLink />}
                                color="white"
                                bg="#232323"
                                _hover={{ bg: "gray.700" }}
                                onClick={handleCopyLink}
                              >
                                Copy Link
                              </MenuItem>
                              <MenuItem
                                icon={<FaRetweet />}
                                color="white"
                                bg="#232323"
                                _hover={{ bg: "gray.700" }}
                                onClick={handleRepost}
                              >
                                Repost
                              </MenuItem>
                            </MenuList>
                          </Menu>
                          {/* <Text color="Black" fontSize="lg">
                            {shares}
                          </Text> */}
                        </Flex>
                      </Flex>
                      </Flex>
                      <Box>
                        <Heading size="sm" my="2">Details</Heading>
                        <Text>{postData.postContent}</Text>
                        {/* <Text fontSize="xs" color="#6e6e6e" as="i">
                          {formatDistanceToNow(new Date(postData.createdAt))}
                          ago
                        </Text> */}
                      </Box>
                      <Box className="sellerInfo__wrapper" mt="12px" borderTopWidth="2px">
                        <Heading size="md" mt="8px">Seller Information</Heading>
                        <Flex m="4px 0" mt="8px" align="center" minW="410px">
                          <Avatar
                            size="md"
                            mr="4px"
                            name={postData.authorName}
                          />
                          <Text ml="4px" width="100%" fontWeight="bold">
                            {postData.authorName}
                          </Text>
                          <Flex
                            direction="column"
                            alignItems="end"
                            width="100%"
                          >
                            <Button
                              leftIcon={<Edit3 />}
                              // colorScheme="teal"
                              color="#d00000"
                              border="2px"
                              borderColor="#d00000"
                              fontWeight="bold"
                              // mb={4} // Adds spacing between the button and the counts
                              onClick={handleAuthorClick}
                            >
                              View Profile
                            </Button>
                          </Flex>
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              )
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default ItemModal;
