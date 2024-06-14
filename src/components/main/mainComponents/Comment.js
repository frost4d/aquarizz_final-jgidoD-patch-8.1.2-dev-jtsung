import {
  Textarea,
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Image,
  Card,
  Input,
  HStack,
  VStack,
  Avatar,
  Collapse,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase/firebaseConfig";
import {
  doc,
  collection,
  getDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { UserAuth } from "../../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import Profile from "../Profile";

const Comments = (props) => {
  const { user, userProfile } = UserAuth();
  //   const id = props.id;
  //   const authorId = props.authorId;
  const id = props.id || "";
  const authorId = props.authorId || "";
  const [comment, setComment] = useState("");
  const [reply, setReply] = useState("");
  const [commentData, setCommentData] = useState([]);
  const [replyCommentId, setReplyCommentId] = useState(null);

  const txt = useRef();

  async function getComments() {
    const data = [];

    try {
      const postRef = doc(db, "shop", id);
      const commentRef = collection(postRef, "comments");
      // const querySnapshot = await getDocs(commentRef)
      const querySnapshot = await getDocs(
        query(commentRef, orderBy("createdAt", "desc"), limit(5))
      );

      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id });
      });
    } catch (err) {}

    return data;
  }
  //getting the comments but suddenly becoming undefined
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const data = [];
      const postRef = doc(db, "shop", id);
      const commentRef = collection(postRef, "comments");
      const querySnapshot = await getDocs(
        query(commentRef, orderBy("createdAt", "desc"), limit(5))
      );

      for (const docSnapshot of querySnapshot.docs) {
        const comment = { ...docSnapshot.data(), id: docSnapshot.id };
        comment.replies = await fetchReplies(comment.id);
        data.push(comment);
      }

      setCommentData(data);
    } catch (err) {
      console.error("Error fetching comments:", err.message);
    }
  };

  const fetchReplies = async (commentId) => {
    const postRef = doc(db, "shop", id);
    const commentRef = doc(postRef, "comments", commentId);
    const replyRef = collection(commentRef, "replies");
    const querySnapshot = await getDocs(
      query(replyRef, orderBy("createdAt", "asc"))
    );

    return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  };

  //   const fetchComments = async () => {
  //     try {
  //       const data = [];
  //       const postRef = doc(db, "shop", id);
  //       const commentRef = collection(postRef, "comments");
  //       const querySnapshot = await getDocs(
  //         query(commentRef, orderBy("createdAt", "desc"), limit(5))
  //       );

  //       querySnapshot.forEach((doc) => {
  //         data.push({ ...doc.data(), id: doc.id });
  //       });

  //       setCommentData(data);
  //     } catch (err) {
  //       console.error("Error fetching comments:", err.message);
  //     }
  //   };

  const handleCommentSubmit = async (parentId) => {
    const obj = {
      //   content: comment,
      content: parentId ? reply : comment,
      authorID: user?.uid,
      name: userProfile.name,
      datePosted: Date.now(),
      createdAt: serverTimestamp(),
      recipientUserID: authorId,
      parentId: parentId,
    };

    try {
      const postRef = doc(db, "shop", id);
      if (parentId) {
        const commentRef = doc(postRef, "comments", parentId);
        const replyRef = collection(commentRef, "replies");
        await addDoc(replyRef, obj);
      } else {
        const commentRef = collection(postRef, "comments");
        await addDoc(commentRef, obj);
      }
      setComment("");
      setReply("");
      setReplyCommentId(null);
      fetchComments();
    } catch (err) {
      console.error("Error adding comment: ", err.message);
    }

    // try {
    //   const postRef = doc(db, "shop", id);
    //   const commentRef = collection(postRef, "comments");
    //   await addDoc(commentRef, obj);
    //   console.log("Comment added:", obj);
    //   setComment("");
    //   setReply("");
    //   setReplyCommentId(null);
    //   fetchComments();
    // } catch (err) {
    //   console.error("Error adding comment: ", err.message);
    // }
  };

  console.log("user:", user);
  console.log("userProfile:", userProfile);
  console.log("id:", id);
  console.log("authorId:", authorId);

  const isWhitespace = (value) => {
    return value.trim() === ""; // trim() removes leading/trailing whitespaces
  };

  const handleChange = (e) => {
    setComment(e.target.value);
  };

  const handleReplyChange = (e) => {
    setReply(e.target.value);
  };

  const handleReply = async (parentId) => {
    await handleCommentSubmit(parentId);
  };

  //   const handleReply = async (parentId) => {
  //     await handleCommentSubmit(parentId);
  //     setReply(""); // Clear reply input after submission
  //   };

  const toggleReply = (commentId) => {
    setReplyCommentId(commentId === replyCommentId ? null : commentId);
  };

  const renderReplies = (comment) => {
    if (!comment.replies) return null;

    return (
      <Box ml="40px" mt="10px">
        {comment.replies.map((reply) => (
          <Card key={reply.id} w="100%" textAlign="start" my="12px">
            <Box mx="24px" p="14px">
              <Avatar
                size="sm"
                name={reply.name}
                authorId={reply.authorID}
                mr="5px"
              />
              <Profile name={reply.name} authorId={reply.authorID} />
              <Text as="i" fontSize="xs" color="gray.500">
                {formatDistanceToNow(reply.datePosted)} ago
              </Text>
            </Box>
            <Box mx="32px" my="24px">
              <Text>{reply.content}</Text>
            </Box>
          </Card>
        ))}
      </Box>
    );
  };
  //   const handleReply = async (parentId) => {
  //     if (!parentId) {
  //       await handleCommentSubmit(null);
  //     } else {
  //       await handleCommentSubmit(parentId);
  //     }
  //   };
  return (
    <>
      <Box>
        {commentData.map((comment) => (
          <Flex key={comment.id} flexDirection="column" align="start">
            <Card w="100%" textAlign="start" my="12px">
              <Box mx="24px" p="14px">
                <Avatar
                  size="sm"
                  name={comment.name}
                  authorId={comment.authorID}
                  mr="5px"
                />
                <Profile name={comment.name} authorId={comment.authorID} />
                <br />
                <Text as="i" fontSize="xs" color="gray.500">
                  {formatDistanceToNow(comment.datePosted)} ago
                </Text>
              </Box>

              <Box mx="32px" my="24px" bor>
                <Text>{comment.content}</Text>
                <Button onClick={() => toggleReply(comment.id)}>Reply</Button>
                <Collapse in={comment.id === replyCommentId}>
                  <Textarea
                    placeholder="Reply to this comment..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    // onChange={handleReplyChange}
                    my="18px"
                  />
                  <Button onClick={() => handleCommentSubmit(comment.id)}>
                    Submit Reply
                  </Button>
                </Collapse>
                {renderReplies(comment)}
                {/* <Textarea
                  placeholder="Reply to this comment..."
                  value={reply}
                  onChange={handleReplyChange}
                  my="18px"
                />
                <Button onClick={() => handleReply(comment.id)}>Reply</Button> */}
              </Box>
            </Card>
          </Flex>
        ))}
      </Box>

      <Flex w="100%">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommentSubmit(null);
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "end",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {/* <Input value={comment} onChange={handleChange} /> */}
          {/* <Textarea value={comment} onChange={handleChange} my="10px"/> */}
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            my="10px"
          />
          {/* <Button type="submit" my="12px" isDisabled={isWhitespace(comment)}> */}
          <Button type="submit" my="12px" isDisabled={comment.trim() === ""}>
            Comment
          </Button>
        </form>
      </Flex>
    </>
  );
};
export default Comments;
