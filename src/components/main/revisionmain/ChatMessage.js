import React, { useState, useEffect, useRef } from 'react';
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
} from '@chakra-ui/react';
import { FaPhone, FaVideo, FaSmile } from 'react-icons/fa';
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
  doc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import Navigation from './Navigation';
import EmojiPicker from 'emoji-picker-react';

const socket = io('http://localhost:3000'); // Replace with your signaling server URL

const ChatMessage = () => {
  const { userId } = useParams();
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentUserName, setCurrentUserName] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [peer, setPeer] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // Fetch users who have messaged you and those you have messaged
  useEffect(() => {
    if (currentUserId) {
      const receivedMessagesQuery = query(
        collection(db, `users1/${currentUserId}/messages`),
        orderBy('createdAt', 'desc')
      );

      const sentMessagesQuery = query(
        collection(db, `users1/${currentUserId}/messages`),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeReceived = onSnapshot(receivedMessagesQuery, snapshot => {
        const receivedUserIds = snapshot.docs.map(doc => doc.data().senderId);
        const sentUserIds = snapshot.docs.map(doc => doc.data().receiverId);
        const allUserIds = new Set([...receivedUserIds, ...sentUserIds]);

        const fetchUsers = async () => {
          const userPromises = Array.from(allUserIds).map(id => getDoc(doc(db, 'users1', id)));
          const userDocs = await Promise.all(userPromises);
          const userList = userDocs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUsers(userList);
        };

        fetchUsers();
      });

      const unsubscribeSent = onSnapshot(sentMessagesQuery, snapshot => {
        // Optionally handle updates from sent messages
      });

      return () => {
        unsubscribeReceived();
        unsubscribeSent();
      };
    }
  }, [currentUserId]);


  // Fetch user list from Firestore
  useEffect(() => {
    if (activeUser && currentUserId) {
      const q = query(
        collection(db, `users1/${currentUserId}/messages`),
        where('receiverId', '==', activeUser.id),
        orderBy('createdAt')
      );
      
      const q2 = query(
        collection(db, `users1/${activeUser.id}/messages`),
        where('receiverId', '==', currentUserId),
        orderBy('createdAt')
      );
  
      const unsubscribeCurrentUser = onSnapshot(q, snapshot => {
        setMessages(snapshot.docs.map(doc => doc.data()));
      });
      
      const unsubscribeActiveUser = onSnapshot(q2, snapshot => {
        setMessages(prevMessages => [
          ...prevMessages,
          ...snapshot.docs.map(doc => doc.data())
        ]);
      });
  
      return () => {
        unsubscribeCurrentUser();
        unsubscribeActiveUser();
      };
    }
  }, [activeUser, currentUserId]);  

  useEffect(() => {
    console.log('Fetching user with ID:', userId);
  
    if (userId) {
      const fetchUserToChatWith = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users1', userId));
          if (userDoc.exists()) {
            const userData = { ...userDoc.data(), id: userDoc.id };
            console.log('Fetched User Data:', userData);
            setActiveUser(userData);
          } else {
            console.error('User does not exist');
            setActiveUser(null); // Ensure activeUser is set to null if user does not exist
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };
      fetchUserToChatWith();
    }
  }, [userId]);
  
  
  // Fetch current user's data
  useEffect(() => {
    if (currentUserId) {
      const fetchCurrentUser = async () => {
        const userDoc = await getDoc(doc(db, 'users1', currentUserId));
        setCurrentUserName(userDoc.data()?.name || '');
      };
      fetchCurrentUser();
    }
  }, [currentUserId]);

  // Fetch chat messages between the current user and the active user
  useEffect(() => {
    if (activeUser && currentUserId) {
      const q = query(
        collection(db, `users1/${currentUserId}/messages`),
        where('senderId', 'in', [currentUserId, activeUser.id]),
        where('receiverId', 'in', [currentUserId, activeUser.id]),
        orderBy('createdAt')
      );
      const unsubscribe = onSnapshot(q, snapshot => {
        setMessages(snapshot.docs.map(doc => doc.data()));
      });
      return () => unsubscribe();
    }
  }, [activeUser, currentUserId]);

  // Handle sending messages
  const handleSend = async () => {
    if (inputValue.trim() && activeUser) {
      await addDoc(collection(db, `users1/${currentUserId}/messages`), {
        text: inputValue,
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: activeUser.id,
        receiverName: activeUser.name,
        createdAt: new Date(),
      });
      setInputValue(''); // Clear input
    }
  };

  const startCall = async () => {
    try {
      // Capture both audio and video streams
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  
      // Set up local media stream and peer
      setMediaStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;  // Set the local video element to show the stream
      }
      const peerInstance = createPeer(true, stream, activeUser.id);
      setPeer(peerInstance);
      setIsCalling(true);
    } catch (error) {
      handleMediaError(error);
    }
  };

  // Set up peer connection
  const createPeer = (initiator, stream, recipientId) => {
    const peer = new SimplePeer({
      initiator,
      stream,
      trickle: false,
    });
    peer.on('signal', signal => socket.emit('call-user', { signalData: signal, to: recipientId }));
    peer.on('stream', stream => setRemoteStream(stream));
    return peer;
  };

  // Handle answering an incoming call
  const handleAnswerCall = () => {
    const peerInstance = createPeer(false, mediaStream, activeUser.id);
    setPeer(peerInstance);
  };

  // Handle media device errors
  const handleMediaError = (error) => {
    console.error('Media error:', error);
    alert(`An error occurred: ${error.message}`);
  };

  // End the call and clean up resources
  const endCall = () => {
    if (peer) peer.destroy();
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    setPeer(null);
    setMediaStream(null);
    setRemoteStream(null);
    setIsCalling(false);
  };

  useEffect(() => {
    socket.on('call-made', handleAnswerCall);
    return () => socket.off('call-made', handleAnswerCall);
  }, [mediaStream]);

  // Update local and remote video elements with media streams
  useEffect(() => {
    if (localVideoRef.current && mediaStream) {
      localVideoRef.current.srcObject = mediaStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [mediaStream, remoteStream]);

  const onEmojiClick = (event, emojiObject) => {
    console.log('Emoji selected:', emojiObject); // For debugging

    // Ensure emojiObject has the 'emoji' property
    if (emojiObject && emojiObject.emoji) {
      setInputValue(prevInput => prevInput + emojiObject.emoji);
      setShowEmojiPicker(false);
    } else {
      console.warn('Invalid emojiObject:', emojiObject);
    }
  };
  
  

  return (
    <Box h="100vh" overflowY="auto">
      <Navigation cartItemCount={cartItemCount} setCartItemCount={setCartItemCount} />
      <Flex h="90vh" w="100%" bg="gray.100" px="24" py="4">
        <Card w="25%" h="100%" p={4} bg="white" borderRight="1px solid #eaeaea">
          <VStack align="stretch" spacing={4} overflowY="auto" maxH="100%">
            {users.map(user => (
              <HStack
                key={user.id}
                onClick={() => setActiveUser(user)}
                cursor="pointer"
                bg={activeUser?.id === user.id ? 'blue.50' : 'white'}
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
            <HStack>
              {activeUser && <Avatar src={activeUser.profileImage} size="md" />}
              <Text fontWeight="bold" fontSize="xl">{activeUser?.name}</Text>
            </HStack>
            <HStack spacing={4}>
              <IconButton icon={<FaPhone />} aria-label="Start Call" onClick={startCall} />
              <IconButton icon={<FaVideo />} aria-label="Start Video Call" onClick={startCall} />
            </HStack>
          </HStack>

          <Box flex="1" overflowY="auto" p={4} bg="gray.50" borderRadius="md">
            {messages.map((msg, index) => (
              <Box key={index} mb={2}>
                <Flex>
                  <Text fontWeight="bold">{msg.senderName}</Text>
                  <Text ml={2} color="gray.500" fontSize="sm">
                    {new Date(msg.createdAt.toDate()).toLocaleTimeString()}
                  </Text>
                </Flex>
                <Text>{msg.text}</Text>
              </Box>
            ))}
          </Box>

          <HStack spacing={2} p={4}>
          <IconButton
              icon={<FaSmile />}
              aria-label="Emoji Picker"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              mr={2}
            />
            {showEmojiPicker && (
              <Box position="absolute" bottom="80px" zIndex={10}>
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </Box>
            )}
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message"
            />
            <Button onClick={handleSend} colorScheme="blue">Send</Button>
          </HStack>
          </>
          ) : (
            <Text align="center">Select a user to start chatting</Text>
          )}
        </Card>
      </Flex>

      {isCalling && (
  <Modal isOpen={isCalling} onClose={endCall}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Video Call with {activeUser?.name}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack spacing={4}>
          <Box>
            <Text fontWeight="bold">Your Video</Text>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              width="100%"
              style={{ border: '2px solid black' }}
            />
          </Box>
          <Box>
            <Text fontWeight="bold">Remote Video</Text>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              width="100%"
              style={{ border: '2px solid black' }}
            />
          </Box>
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Button onClick={endCall} colorScheme="red">End Call</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
)}

    </Box>
  );
};

export default ChatMessage;
