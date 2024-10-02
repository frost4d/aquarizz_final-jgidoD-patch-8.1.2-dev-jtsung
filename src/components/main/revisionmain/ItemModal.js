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
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth, storage } from "./../../../firebase/firebaseConfig";
import { useLocation } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { motion, useAnimation } from "framer-motion";

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
import { ArrowLeft, ArrowRight, Mail, MapPin } from "react-feather";
import { UserAuth } from "../../context/AuthContext";
import { UserPlus, UserCheck, Edit3 } from "react-feather";
import Loading from "./components/Loading";
const ItemModal = () => {
  const controls = useAnimation();
  const [count, setCount] = useState(0);
  const toast = useToast();
  const { userId, post } = useParams();
  const { postId } = useParams();
  const { user } = UserAuth();
  const primaryColor = "#FFC947";
  const [isLoading, setIsLoading] = useState();
  const [postData, setPostData] = useState();
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
    const postUrl = `${window.location.origin}/marketplace/item/${postId}`;

    // Log URL to ensure it's correct
    console.log("Post:", post);

    console.log("Copying URL:", postUrl);

    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        toast({
          title: "Link Copied!",
          description: "The post URL has been copied to your clipboard.",
          status: "success",
          duration: 3000,
          position: "top",
        });
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        toast({
          title: "Copy Failed!",
          description: "Failed to copy the link. Please try again.",
          status: "error",
          duration: 3000,
          position: "top",
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
  // index checker
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "marketplace", postId);
        const docSnap = await getDoc(docRef);
        // Check if the document exists and get the data
        if (docSnap.exists()) {
          const itemData = docSnap.data();
          setPostData(itemData);
          // setCount(postData.postImage?.length || 0);
        }
      } catch (err) {
        console.log(err.message);
      } finally {
        // do something
      }
    };

    fetchItem();
  }, [postId]);

  console.log(postData);
  useEffect(() => {
    if (postData && postData.postImage) {
      setCount(postData.postImage.length);
    }
  }, [postData]);

  const handleAuthorClick = () => {
    navigate(`/profile/${postData.authorID}`);
  };

  const slideVariants = {
    hidden: (direction) => ({
      x: direction > 0 ? 1000 : -1000, // Slide in from right or left
      opacity: 0,
    }),
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000, // Slide out to right or left
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    }),
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % count);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + count) % count);
  };

  return (
    <Suspense fallback={<Loading />}>
      <Box
        size="full"
        isOpen={modalContainer.isOpen}
        onClose={handleCloseModal}
      >
        <Box>
          {isLoading ? (
            <span className="loader"></span>
          ) : (
            postData && (
              <Flex h="100vh" justify="space-between">
                <Flex
                  flex="1"
                  justify="center"
                  className="imageWrapper__market"
                  position="relative"
                  overflow="hidden"
                  // bg="rgba(0,0,0,.1)"
                >
                  <Image
                    position="absolute"
                    transform="translateY(-550px)"
                    h="200%"
                    objectFit="cover"
                    src={postData.postImage[currentIndex]}
                    alt={postData.title}
                    filter="blur(24px)" // Apply blur effect
                    zIndex="-2" // Send the blurred image to the back
                    bgRepeat="no-repeat"
                  />
                  <Flex
                    display={
                      !Array.isArray(postData.postImage) ? "none" : "flex"
                    }
                    className="arrowWrapper"
                    position="absolute"
                    zIndex="4"
                    w="100%"
                    h="100%"
                    align="center"
                    justify="space-between"
                  >
                    <Flex
                      className="buttonNav_wrapper"
                      p="0 8px"
                      cursor="pointer"
                      align="center"
                      _hover={{ bg: "rgba(0, 0, 0, 0.1)" }}
                      h="100%"
                    >
                      <Box
                        className="button__left"
                        color="gray.500"
                        p="12px"
                        bg="#E5E4E2"
                        borderRadius="24px"
                        onClick={handlePrev}
                      >
                        <ArrowLeft />
                      </Box>
                    </Flex>

                    <Flex
                      className="buttonNav_wrapper"
                      p="0 8px"
                      cursor="pointer"
                      align="center"
                      _hover={{ bg: "rgba(0, 0, 0, 0.1)" }}
                      h="100%"
                    >
                      <Box
                        className="button__right"
                        color="gray.500"
                        p="12px"
                        bg="#E5E4E2"
                        borderRadius="24px"
                        onClick={handleNext}
                      >
                        <ArrowRight />
                      </Box>
                    </Flex>
                  </Flex>
                  {/* {postData && (
                      <motion.div
                        key={postData.postImage[count]}
                        variants={slideVariants}
                        // custom={direction}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        position="absolute"
                        top="0"
                        left="0"
                        w="full"
                        h="full"
                      >
                        <Flex
                          justify="center"
                          w="100%"
                          className="image__market__bg"
                        >
                          <Image
                            position="absolute"
                            h="120%"
                            objectFit="cover"
                            src={postData.postImage[0]}
                            alt={postData.title}
                            filter="blur(8px)" // Apply blur effect
                            zIndex="-2" // Send the blurred image to the back
                            bgRepeat="no-repeat"
                          />
                          <Image
                            objectFit="contain"
                            src={postData.postImage[0]}
                            alt={postData.title}
                          />
                        </Flex>
                      </motion.div>
                    )} */}

                  {postData && !Array.isArray(postData.postImage) ? (
                    <>
                      <Flex
                        justify="center"
                        w="100%"
                        className="image__market__bg"
                      >
                        <Image
                          position="absolute"
                          h="120%"
                          objectFit="cover"
                          src={postData.postImage}
                          alt={postData.title}
                          filter="blur(8px)" // Apply blur effect
                          zIndex="-2" // Send the blurred image to the back
                          bgRepeat="no-repeat"
                        />
                        <Image
                          objectFit="contain"
                          src={postData.postImage}
                          alt={postData.title}
                        />
                      </Flex>
                    </>
                  ) : (
                    <Flex h="100%" key={postData.postImage[currentIndex]}>
                      <Image
                        h="100%"
                        objectFit="contain"
                        src={postData.postImage[currentIndex]}
                      />
                    </Flex>
                  )}
                </Flex>
                <Box
                  w="100%"
                  color="#000401"
                  flex=".4"
                  p="16px 8px"
                  m="0 16px 0"
                >
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
                      <Heading size="sm" my="2">
                        Details
                      </Heading>
                      <Text>{postData.postContent}</Text>
                      {/* <Text fontSize="xs" color="#6e6e6e" as="i">
                          {formatDistanceToNow(new Date(postData.createdAt))}
                          ago
                        </Text> */}
                    </Box>
                    <Flex color="gray.500" align="center" gap={1}>
                      <MapPin size={12} />
                      <Text fontSize="sm">Around {postData?.city}</Text>
                    </Flex>
                    <Box
                      className="sellerInfo__wrapper"
                      mt="12px"
                      borderTopWidth="2px"
                    >
                      <Heading size="md" mt="8px">
                        Seller Information
                      </Heading>

                      <Flex m="4px 0" mt="8px" align="center" minW="410px">
                        <Avatar size="md" mr="4px" name={postData.authorName} />
                        <Text ml="4px" width="100%" fontWeight="bold">
                          {postData.authorName}
                        </Text>
                        <Flex direction="column" alignItems="end" width="100%">
                          <Button
                            // leftIcon={<Edit3 />}
                            // colorScheme="teal"
                            bg="#FEECB3"
                            color="#0f0f0f"
                            border="1px solid #FFC947"
                            borderColor="#FFC947"
                            fontWeight="500"
                            // mb={4} // Adds spacing between the button and the counts
                            // onClick={navigate(`/profile/${postData.authorID}`)}
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
        </Box>
      </Box>
    </Suspense>
  );
};
export default ItemModal;
