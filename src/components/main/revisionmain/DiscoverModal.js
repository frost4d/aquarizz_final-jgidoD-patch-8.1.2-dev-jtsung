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
  FaEllipsisV,
  FaTrash
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
  Input,
} from "@chakra-ui/react";
import MarketItem from "./MarketItem";
import { useEffect, useState } from "react";
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
const DiscoverModal = () => {
  const [post, setPost] = useState();

  const controls = useAnimation();
  const [count, setCount] = useState(0);
  const toast = useToast();
  const { userId } = useParams();
  const { discoverId } = useParams();
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
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [userAvatar, setUserAvatar] = useState("");


  //   const location = useLocation();
  //   let history = useHistory();
  const handleLike = async () => {
    const postRef = doc(db, "discover", discoverId);

    if (!isLiked) {
      await updateDoc(postRef, {
        likes: arrayUnion(user.uid),
      });
      setLikes(likes + 1);
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
    const postUrl = `${window.location.origin}/discover/post/${discoverId}`;

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
  console.log(post);
  useEffect(() => {
    const fetchComments = async () => {
      const commentsRef = collection(db, "discover", discoverId, "comments");
      const querySnapshot = await getDocs(commentsRef);
      const fetchedComments = [];
      querySnapshot.forEach((doc) => {
        console.log(doc.data());
        const commentData = doc.data();
        fetchedComments.push({
          id: doc.id,
          ...commentData,
        });
      });
      setComments(fetchedComments);
    };
    fetchComments();
  }, [post]);

  // index checker
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "discover", discoverId);
        const docSnap = await getDoc(docRef);
        // Check if the document exists and get the data
        if (docSnap.exists()) {
          const itemData = docSnap.data();
          setPost(itemData);
          // setCount(postData.postImage?.length || 0);
        }
      } catch (err) {
        // console.log(err.message);
      } finally {
        // do something
      }
    };

    fetchItem();
  }, [discoverId]);
  console.log(post);
  console.log();
  useEffect(() => {
    const fetchPostData = async () => {
      const postRef = doc(db, "discover", discoverId);
      const postDoc = await getDoc(postRef);

      if (postDoc.exists()) {
        const postData = postDoc.data();
        setLikes(postData.likes?.length || 0);
        setIsLiked(postData.likes?.includes(user?.uid) || false);
        setShares(postData.shares?.length || 0);
      }
    };

    fetchPostData();
  }, [post, user]);

  useEffect(() => {
    if (post && post.postImage) {
      setCount(post.postImage.length);
    }
  }, [post]);
  const handleAuthorClick = () => {
    if (post.authorID) {
      navigate(`/profile/${post.authorID}`);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % count);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + count) % count);
  };

  const handleAddComment = async () => {
    const commentsRef = collection(db, "discover", discoverId, "comments");

    // Fetch user data from 'users1' collection
    const userRef = doc(db, "users1", user.uid);
    const userDoc = await getDoc(userRef);
    const userName = userDoc.exists() ? userDoc.data().name : "Unknown";

    const newComment = {
      userId: user.uid,
      userName: userName,
      comment: comment,
      createdAt: new Date(),
    };

    await addDoc(commentsRef, newComment);

    // Update the comments state immediately with the new comment
    setComments([...comments, { id: new Date().getTime(), ...newComment }]);
    setComment("");
  };

  const handleDeleteComment = async (commentId) => {
    if (!user || !post || !post.id || !commentId) return;

    try {
      const commentRef = doc(db, "discover", post.id, "comments", commentId);
      await deleteDoc(commentRef);

      // Update the comments state by filtering out the deleted comment
      setComments(comments.filter((comment) => comment.id !== commentId));

      toast({
        title: "Comment Deleted",
        description: "Your comment has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting comment: ", error);
      toast({
        title: "Failed to Delete Comment",
        description:
          "There was an error deleting your comment. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Modal
        size="full"
        isOpen={modalContainer.isOpen}
        onClose={handleCloseModal}
      >
        <ModalContent>
          <ModalBody p={0} display="flex" flexDirection="row">
            {post && (
              <>
                <Box
                  flex="1"
                  position="relative"
                  h="100vh"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Box
                    position="absolute"
                    inset="0"
                    zIndex="-1"
                    style={{
                      filter: "blur(40px)",
                    }}
                    backgroundImage={`url(${post.postVideo || post.postImage})`}
                    backgroundSize="cover"
                  />
                  <Box
                    position="absolute"
                    inset="0"
                    bg="rgba(0, 0, 0, 0.5)"
                    zIndex="-1"
                  />
                  <Box
                    width="55%"
                    height="100vh"
                    position="relative"
                    bg="black"
                  >
                    {post.postImage && (
                      <Image
                        src={post.postImage}
                        alt="Post Image"
                        objectFit="cover"
                        h="100%"
                        w="100%"
                      />
                    )}
                    {post.postVideo && (
                      <video
                        autoPlay
                        loop
                        controls
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      >
                        <source src={post.postVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </Box>
                </Box>
                <Box
                  p="8"
                  bg="black"
                  color="white"
                  w="35%"
                  h="100vh"
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                >
                  <Flex align="center">
                    <Avatar
                      size="md"
                      name={post.authorName}
                      src={post.authorAvatar}
                      cursor="pointer"
                      onClick={handleAuthorClick} //
                    />
                    <Text
                      color="white"
                      ml="2"
                      fontWeight="bold"
                      fontSize="xl"
                      cursor="pointer"
                      onClick={handleAuthorClick}
                    >
                      {post.authorName}
                    </Text>
                  </Flex>
                  <Flex w="100%" h="auto">
                    <Text fontSize="lg">{post.postContent}</Text>
                  </Flex>
                  <Flex w="100%" h="auto">
                    <Text fontSize="xs">{post.tag}</Text>
                  </Flex>
                  <Flex
                    // mb="2"
                    flexDirection="row"
                    alignItems="center"
                    w="100%"
                    justifyContent="center"
                    borderTopWidth="2px"
                    borderColor="white"
                  >
                    <Flex alignItems="center" flexDirection="column">
                      <IconButton
                        mx="10"
                        icon={<FaHeart />}
                        aria-label="Like"
                        color={isLiked ? "red.500" : "white"}
                        bg="none"
                        onClick={handleLike}
                        _hover={{ bg: "none" }}
                      />
                      <Text color="white" fontSize="lg">
                        {likes}
                      </Text>
                    </Flex>
                    <Flex alignItems="center" flexDirection="column">
                      <IconButton
                        mx="10"
                        icon={<FaComment />}
                        aria-label="Comment"
                        color="white"
                        bg="none"
                        _hover={{ bg: "none" }}
                        onClick={() => {
                          handleAddComment();
                        }}
                      />
                      <Text color="white" fontSize="lg">
                        {comments.length}
                      </Text>
                    </Flex>
                    <Flex alignItems="center" flexDirection="column">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          mx="10"
                          icon={<FaShare />}
                          aria-label="Share"
                          color="white"
                          bg="none"
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
                      <Text color="white" fontSize="lg">
                        {shares}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex
                    flexDirection="column"
                    borderLeftRadius="12px"
                    bg="black"
                    color="white"
                    p="4"
                    h="400px"
                    mb="2"
                    borderWidth="2px"
                    borderColor="white"
                    overflowY="auto"
                  >
                    {comments.map((comment) => (
                      <Flex
                      key={comment.id}
                      alignItems="flex-start"
                      mb="4"
                      borderWidth="1px"
                      borderColor="gray.600"
                      borderRadius="md"
                      bg="gray.800"
                      ml="8"
                      p="3"
                      position="relative"
                      width="fit-content" // Makes the width dynamic based on the content
                      minH="auto" // Ensures the height adapts based on content length
                      maxH="auto" // Ensures the height is flexible
                      _before={{
                        content: '""',
                        position: "absolute",
                        top: "12px",
                        left: "-8px",
                        width: "8px",
                        height: "8px",
                        backgroundColor: "gray.800",
                        transform: "rotate(45deg)",
                        zIndex: "-1",
                      }}
                    >
                      {/* Avatar, positioned outside the border */}
                      <Box position="relative">
                        <Avatar
                          size="sm"
                          name={comment.userName}
                          src={comment.userAvatar || userAvatar} // Use fetched user avatar
                          mr="4"
                          position="absolute"
                          left="-50px"
                          top="-8px" // Adjust vertical alignment with the comment box
                        />
                      </Box>
                      <Flex flexDirection="column" ml="2" flex="1">
                        {/* Username and Comment Text */}
                        <Text fontWeight="bold" fontSize="sm" color="white">
                          {comment.userName}
                        </Text>
                        <Text fontSize="md" color="white">
                          {comment.comment}
                        </Text>
    
                        {/* Timestamp */}
                        <Text fontSize="xs" color="gray.500" mt="1">
                          {comment.createdAt && comment.createdAt.seconds
                            ? new Date(
                                comment.createdAt.seconds * 1000
                              ).toLocaleString()
                            : comment.createdAt instanceof Date
                            ? comment.createdAt.toLocaleString()
                            : "Invalid Date"}
                        </Text>
                      </Flex>
    
                      {/* Menu for each comment, only show delete if user is the author */}
                      {comment.userId === user.uid && (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FaEllipsisV />}
                            variant="ghost"
                          />
                          <MenuList bg="#232323" borderColor="gray.700">
                            {/* Delete option */}
                            <MenuItem
                              icon={<FaTrash />}
                              color="white"
                              bg="#232323"
                              _hover={{ bg: "gray.700" }}
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      )}
                    </Flex>
                    ))}
                  </Flex>
                  <Flex mt="4" align="center">
                    <Avatar
                      size="sm"
                      name="Current User"
                      src="current-user-avatar-url"
                    />
                    <Input
                      ml="2"
                      placeholder="Add a comment..."
                      bg="white"
                      color="black"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <IconButton
                      ml="2"
                      icon={<FaComment />}
                      aria-label="Comment"
                      color="white"
                      bg="none"
                      onClick={() => {
                        handleAddComment();
                        console.log("clicked");
                      }}
                    />
                  </Flex>
                </Box>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default DiscoverModal;
