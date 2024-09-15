import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Avatar,
  Flex,
  Card,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Center,
} from "@chakra-ui/react";
import { FaPhone, FaVideo, FaSmile } from "react-icons/fa";
import { db } from "../../../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  getDoc,
  doc,
  limit,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import SimplePeer from "simple-peer";
import io from "socket.io-client";
import Navigation from "./Navigation";
import EmojiPicker from "emoji-picker-react";

const socket = io("http://localhost:3000"); // Replace with your signaling server URL

const ChatMessage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [cartItemCount, setCartItemCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentUserName, setCurrentUserName] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [peer, setPeer] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [caller, setCaller] = useState(null);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Real-time updates for the sender's user list
  useEffect(() => {
    if (currentUserId) {
      const usersQuery = query(
        collection(db, "users1"),
        orderBy("lastMessageTime", "desc")
      );
  
      const unsubscribe = onSnapshot(usersQuery, async (snapshot) => {
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Create an array of promises to filter users asynchronously
        const filteredUsersPromises = userList.map(async (user) => {
          if (user.id !== currentUserId) {
            // Check if the user has exchanged messages with the current user
            const sentMessages = await getDocs(
              query(
                collection(db, `users1/${currentUserId}/messages`),
                where("receiverId", "==", user.id)
              )
            );
            const receivedMessages = await getDocs(
              query(
                collection(db, `users1/${user.id}/messages`),
                where("receiverId", "==", currentUserId)
              )
            );
  
            return !sentMessages.empty || !receivedMessages.empty ? user : null;
          }
          return null;
        });
  
        // Resolve all promises and filter out null values
        const filteredUsers = (await Promise.all(filteredUsersPromises)).filter(
          (user) => user !== null
        );
  
        setUsers(filteredUsers);
      });
  
      return () => unsubscribe();
    }
  }, [currentUserId]);
  

  // Fetch current user's data
  useEffect(() => {
    if (currentUserId) {
      const fetchCurrentUser = async () => {
        const userDoc = await getDoc(doc(db, "users1", currentUserId));
        setCurrentUserName(userDoc.data()?.name || "");
      };
      fetchCurrentUser();
    }
  }, [currentUserId]);

  useEffect(() => {
    console.log("Fetching user with ID:", userId);

    if (userId) {
      const fetchUserToChatWith = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users1", userId));
          if (userDoc.exists()) {
            const userData = { ...userDoc.data(), id: userDoc.id };
            console.log("Fetched User Data:", userData);
            setActiveUser(userData);
          } else {
            console.error("User does not exist");
            setActiveUser(null); // Ensure activeUser is set to null if user does not exist
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
      fetchUserToChatWith();
    }
  }, [userId]);



  useEffect(() => {
    if (activeUser && currentUserId) {
      // Query messages sent by the current user to the active user
      const q1 = query(
        collection(db, `users1/${currentUserId}/messages`),
        where("receiverId", "==", activeUser.id),
        orderBy("createdAt")
      );

      // Query messages sent by the active user to the current user
      const q2 = query(
        collection(db, `users1/${activeUser.id}/messages`),
        where("receiverId", "==", currentUserId),
        orderBy("createdAt")
      );

      // Combine the two sets of messages and sort them by createdAt
      const unsubscribe1 = onSnapshot(q1, (snapshot1) => {
        const currentUserMessages = snapshot1.docs.map((doc) => doc.data());

        const unsubscribe2 = onSnapshot(q2, (snapshot2) => {
          const activeUserMessages = snapshot2.docs.map((doc) => doc.data());

          // Combine both users' messages and sort them by createdAt
          const combinedMessages = [
            ...currentUserMessages,
            ...activeUserMessages,
          ].sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);

          setMessages(combinedMessages);
        });

        return () => unsubscribe2();
      });

      return () => unsubscribe1();
    }
  }, [activeUser, currentUserId]);

 
  const handleSend = async () => {
    if (inputValue.trim() && activeUser) {
      const messageData = {
        text: inputValue,
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: activeUser.id,
        receiverName: activeUser.name,
        createdAt: serverTimestamp(),
      };

      await Promise.all([
        addDoc(collection(db, `users1/${currentUserId}/messages`), messageData),
        addDoc(collection(db, `users1/${activeUser.id}/messages`), messageData),
        updateDoc(doc(db, `users1/${currentUserId}`), {
          lastMessageTime: serverTimestamp(),
        }),
        updateDoc(doc(db, `users1/${activeUser.id}`), {
          lastMessageTime: serverTimestamp(),
        }),
      ]);

 

      setInputValue("");
    }
  };

  useEffect(() => {
    const listMediaDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log("All Media devices:", devices);

        const cameras = devices.filter(
          (device) => device.kind === "videoinput"
        );
        const microphones = devices.filter(
          (device) => device.kind === "audioinput"
        );

        console.log("Cameras:", cameras);
        console.log("Microphones:", microphones);
      } catch (error) {
        console.error("Error enumerating devices:", error);
      }
    };

    listMediaDevices();
  }, []);

  const startCall = async () => {
    try {
      // Capture both audio and video streams
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Set up local media stream and peer
      setMediaStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream; // Set the local video element to show the stream
      }
      const peerInstance = createPeer(true, stream, activeUser.id);
      setPeer(peerInstance);
      setIsCalling(true);
    } catch (error) {
      // handleMediaError(error);
      if (error.name === "NotAllowedError") {
        alert("Permission to access camera and microphone was denied.");
      } else if (error.name === "NotFoundError") {
        alert("Camera or microphone not found.");
      } else if (error.name === "NotReadableError") {
        alert(
          "Camera or microphone is already in use or could not be accessed."
        );
      } else {
        alert(`An unexpected error occurred: ${error.message}`);
      }
      console.error("Media error:", error);
    }
  };

  // Set up peer connection
  const createPeer = (initiator, stream, recipientId) => {
    const peer = new SimplePeer({
      initiator,
      stream,
      trickle: false,
    });
    peer.on("signal", (signal) =>
      socket.emit("call-user", { signalData: signal, to: recipientId })
    );
    console.log("Signal sent to:", recipientId);
    peer.on("stream", (stream) => setRemoteStream(stream));
    return peer;
  };

  const handleAnswerCall = ({ signalData, from }) => {
    setCaller(from); // Set the caller info
    setIsReceivingCall(true);
    const peerInstance = createPeer(false, mediaStream, from);
    peerInstance.signal(signalData);
    setPeer(peerInstance);
  };

  // End the call and clean up resources
  const endCall = () => {
    if (peer) peer.destroy();
    if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
    setPeer(null);
    setIsReceivingCall(false);
    // setMediaStream(null);
    setRemoteStream(null);
    setIsCalling(false);
  };

  const handleAcceptCall = () => {
    setIsReceivingCall(false);
    if (caller) {
      const peerInstance = createPeer(false, mediaStream, caller);
      peerInstance.signal(caller.signalData);
      setPeer(peerInstance);
    }
  };

  const handleDeclineCall = () => {
    setIsReceivingCall(false);
    socket.emit("decline-call", { to: caller });
    setCaller(null);
  };

  useEffect(() => {
    socket.on("incoming-call", handleAnswerCall);
    socket.on("call-accepted", ({ signalData }) => {
      if (peer) peer.signal(signalData);
    });
    socket.on("call-rejected", () => {
      alert("The user declined your call.");
      endCall();
    });
    return () => {
      socket.off("incoming-call", handleAnswerCall);
      socket.off("call-accepted");
      socket.off("call-rejected");
    };
  }, [peer, mediaStream]);

  useEffect(() => {
    if (localVideoRef.current && mediaStream) {
      localVideoRef.current.srcObject = mediaStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [mediaStream, remoteStream]);


  const handleEmojiClick = (emojiData) => {
    const selectedEmoji = emojiData.emoji; // Fix here: use emojiData.emoji
    setInputValue((prev) => prev + selectedEmoji);
  };
  

  useEffect(() => {
    if (showEmojiPicker) {
      console.log("Emoji picker is shown");
      // Any other side effects when emoji picker is shown
    } else {
      console.log("Emoji picker is hidden");
      // Any other side effects when emoji picker is hidden
    }
  }, [showEmojiPicker]);

  const handleAuthorClick = () => {
    if (activeUser && activeUser.authorID) {
      navigate(`/profile/${activeUser.authorID}`);
    } else {
      console.error("No authorID found for the active user.");
    }
  };

  return (
    <Box h="100vh" overflowY="auto">
      <Navigation
        cartItemCount={cartItemCount}
        setCartItemCount={setCartItemCount}
      />
      <Flex h="90vh" w="100%" bg="gray.100" px="24" py="4">
        <Card w="25%" h="100%" p={4} bg="white" borderRight="1px solid #eaeaea">
          <VStack align="stretch" spacing={4} overflowY="auto" maxH="100%">
            {users.map((user) => (
              <HStack
                key={user.id}
                onClick={() => setActiveUser(user)}
                cursor="pointer"
                bg={activeUser?.id === user.id ? "blue.50" : "white"}
                p={2}
                borderRadius="md"
              >
                <Avatar src={user.profileImage} size="md" />
                <Text fontWeight="bold">{user.name}</Text>
              </HStack>
            ))}
          </VStack>
        </Card>

        <Card flex="1" display="flex" flexDirection="column" ml="4">
          {activeUser ? (
            <>
              <HStack justifyContent="space-between" alignItems="center" p={4}>
                <HStack cursor="pointer" onClick={handleAuthorClick}>
                  {/* {activeUser && ( */}
                  <Avatar src={activeUser.profileImage} size="md" />
                  {/* // )} */}
                  <Text fontWeight="bold" fontSize="xl">
                    {activeUser?.name}
                  </Text>
                </HStack>
                <HStack spacing={4}>
                  <IconButton
                    icon={<FaPhone />}
                    aria-label="Start Call"
                    onClick={startCall}
                    disabled={isCalling}
                  />
                  <IconButton
                    icon={<FaVideo />}
                    aria-label="Start Video Call"
                    onClick={startCall}
                    disabled={isCalling}
                  />
                </HStack>
              </HStack>

              {isCalling && (
                <VStack>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: "50%", backgroundColor: "black" }}
                  />
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: "50%", backgroundColor: "black" }}
                  />
                  <Button onClick={endCall} colorScheme="red">
                    End Call
                  </Button>
                </VStack>
              )}

              <Box
                p={4}
                bg="gray.50"
                flex="1"
                overflowY="scroll"
                display="flex"
                flexDirection="column-reverse"
                ref={messagesEndRef}
              >
                {messages
                  .slice()
                  .reverse()
                  .map((msg, index) => (
                    <Flex
                      key={index}
                      direction="column"
                      align={msg.senderId === currentUserId ? "end" : "start"}
                      // mb={2}
                    >
                      {index < messages.length - 1 && (
                        <Flex
                          justify="center"
                          mt={2}
                          mb={2}
                          alignItems="center"
                          w="100%"
                        >
                          <Box
                            px={2}
                            py={1}
                            color="gray.600"
                            fontSize="xs"
                            textAlign="center"
                          >
                            {/* {new Date(
                            msg.createdAt.toDate()
                          ).toLocaleTimeString()} */}
                            <Text fontSize="sm" color="gray.500">
                              {msg.createdAt
                                ? new Date(
                                    msg.createdAt.seconds * 1000
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Unknown time"}
                            </Text>
                          </Box>
                        </Flex>
                      )}
                      <Flex direction="column">
                        <Flex direction="row">
                          <Flex alignItems="end">
                            {msg.senderId !== currentUserId && (
                              <Avatar
                                name={msg.senderName}
                                src={activeUser.profileImage}
                                size="sm"
                                mr={3}
                              />
                            )}
                          </Flex>
                          <Box
                            p={3}
                            borderRadius="md"
                            bg={
                              msg.senderId === currentUserId
                                ? "blue.400"
                                : "gray.200"
                            }
                            color={
                              msg.senderId === currentUserId ? "white" : "black"
                            }
                            maxWidth="650px"
                            mt="4px"
                            whiteSpace="normal"  // Ensure text wraps
                            wordBreak="break-word" // Handle long words
                          >
                            <Text>{msg.text}</Text>
                          </Box>
                        </Flex>
                      </Flex>
                    </Flex>
                  ))}
              </Box>

              <HStack spacing={2} p={4}>
                <IconButton
                  icon={<FaSmile />}
                  aria-label="Emoji Picker"
                  // onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  mr={2}
                />
                {showEmojiPicker && (
                  <Box ref={emojiPickerRef} position="absolute" bottom="80px" zIndex={1000}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                    {/* <EmojiPicker
                      onEmojiClick={(e, emoji) =>
                        setInputValue(inputValue + emoji.emoji)
                      }
                    /> */}
                  </Box>
                )}

                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSend();
                    }
                  }}
                />
                <Button onClick={handleSend} colorScheme="blue">
                  Send
                </Button>
              </HStack>
            </>
          ) : (
            <Text align="center" mt="50px">
              Select a user to start chatting
            </Text>
          )}
        </Card>
      </Flex>

      {isCalling && (
        <Box
          position="fixed"
          bottom="0"
          right="0"
          p={4}
          bg="black"
          borderRadius="md"
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            width="400px"
            height="350px"
          />
          <Button mt={2} onClick={endCall}>
            End Call
          </Button>
        </Box>
      )}

      <Modal isOpen={isReceivingCall} onClose={() => setIsReceivingCall(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Incoming Call</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{activeUser?.name} is calling...</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" onClick={handleAcceptCall}>
              Accept
            </Button>
            <Button colorScheme="red" onClick={handleDeclineCall}>
              Decline
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* {isCalling && (
        <>
          <Box
            position="fixed"
            bottom="0"
            right="0"
            p={4}
            bg="black"
            borderRadius="md"
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              width="400px"
              height="350px"
            />
            <Button mt={2} onClick={endCall}>
              End Call
            </Button>
          </Box>

          {remoteStream && (
            <Box
              position="fixed"
              top="0"
              left="0"
              p={4}
              bg="black"
              borderRadius="md"
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                width="400px"
                height="350px"
              />
            </Box>
          )}
        </>
      )} */}
    </Box>
  );
};

export default ChatMessage;
