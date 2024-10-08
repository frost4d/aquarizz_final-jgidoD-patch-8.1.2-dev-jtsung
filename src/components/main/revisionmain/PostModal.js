import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Image,
  Text,
  Button,
  Flex,
  Box,
  Avatar,
  Input,
  IconButton,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from "@chakra-ui/react";
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
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { UserAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PostModal = ({ isOpen, onClose, post, userProfile }) => {
  // const [likes, setLikes] = useState(post?.likes || 0);
  // const [isLiked, setIsLiked] = useState(false);
  const { user } = UserAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post?.likes?.length || 0);
  const [shares, setShares] = useState(post?.shares?.length || 0);

  const [isLiked, setIsLiked] = useState(
    post?.likes?.includes(user?.uid) || false
  );
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (post && post.id) {
      const fetchComments = async () => {
        const commentsRef = collection(db, "discover", post.id, "comments");
        const querySnapshot = await getDocs(commentsRef);
        const fetchedComments = [];
        querySnapshot.forEach((doc) => {
          const commentData = doc.data();
          fetchedComments.push({
            id: doc.id,
            ...commentData,
          });
        });
        setComments(fetchedComments);
      };

      fetchComments();
    }
  }, [post]);

  useEffect(() => {
    const fetchPostData = async () => {
      if (post && post.id) {
        const postRef = doc(db, "discover", post.id);
        const postDoc = await getDoc(postRef);

        if (postDoc.exists()) {
          const postData = postDoc.data();
          setLikes(postData.likes?.length || 0);
          setIsLiked(postData.likes?.includes(user?.uid) || false);
          setShares(postData.shares?.length || 0);
        }
      }
    };

    fetchPostData();
  }, [post, user]);

  if (!post) return null;

  const handleLike = async () => {
    if (!user || !post || !post.id) return;
    const postRef = doc(db, "discover", post.id);

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

  const handleAddComment = async () => {
    if (!user || !post || !post.id) return;
    const commentsRef = collection(db, "discover", post.id, "comments");

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

  // const handleAddShare = async () => {
  //   if (!user || !post || !post.id) return;

  //   const sharesRef = collection(db, "discover", post.id, "shares");

  //   // Fetch user data from 'users1' collection
  //   const userRef = doc(db, "users1", user.uid);
  //   const userDoc = await getDoc(userRef);
  //   const userName = userDoc.exists() ? userDoc.data().name : "Unknown";

  //   await addDoc(sharesRef, {
  //     userId: user.uid,
  //     userName: userName,
  //     sharedAt: new Date(),
  //   });
  //   setShares(shares + 1);
  // };

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
    await updateDoc(doc(db, "discover", post.id), {
      shares: arrayUnion(user.uid),
    });

    setShares((prevShares) => prevShares + 1);

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
    
    navigator.clipboard.writeText(postUrl)
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
  
  const handleAuthorClick = () => {
    if (post.authorID) {
      navigate(`/profile/${post.authorID}`);
    }
  };

  console.log("postVideo URL:", post.postVideo);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg="black">
        <ModalCloseButton color="white" />
        <ModalBody p={0} display="flex" flexDirection="row">
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
            <Box width="55%" height="100vh" position="relative" bg="black">
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
              <Text color="white" ml="2" fontWeight="bold" fontSize="xl" cursor="pointer"
                onClick={handleAuthorClick}>
                {post.authorName}
              </Text>
            </Flex>
            <Flex w="100%" h="auto">
              <Text fontSize="lg">{post.postContent}</Text>
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
                  onClick={handleAddComment}
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
                  <MenuList
                    bg="#232323"
                    borderColor="gray.700"
                  >
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
              bg="black"
              color="white"
              p="4"
              h="400px"
              mb="2"
              borderWidth="1px"
              borderColor="white"
              overflowY="auto"
            >
              {comments.map((comment) => (
                <Flex
                  key={comment.id}
                  alignItems="center"
                  // mt="2"
                  mb="4"
                  h="auto"
                >
                  <Avatar size="sm" mb="6" name={comment.userName} />
                  <Flex flexDirection="column">
                    <Text
                      py="4"
                      color="white"
                      ml="2"
                      fontWeight="bold"
                      fontSize="sm"
                    >
                      {post.authorName}
                    </Text>
                    <Text ml="2" fontSize="md" color="white">
                      {comment.comment}
                    </Text>
                  </Flex>
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
                onClick={handleAddComment}
              />
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PostModal;
