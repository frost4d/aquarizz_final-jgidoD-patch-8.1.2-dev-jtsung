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

  // Fetch user list from Firestore
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     if (!currentUserId) return;

  //     // Create a query to get messages sent or received by the current user
  //     const q = query(
  //       collection(db, 'messages'),
  //       where('senderId', '==', currentUserId)
  //     );
  //     const querySnapshot = await getDocs(q);
  //     const userIds = new Set(
  //       querySnapshot.docs.map(doc => doc.data().receiverId)
  //     );

  //     const q2 = query(
  //       collection(db, 'messages'),
  //       where('receiverId', '==', currentUserId)
  //     );
  //     const querySnapshot2 = await getDocs(q2);
  //     querySnapshot2.docs.forEach(doc => userIds.add(doc.data().senderId));

  //     // Fetch user details for these userIds
  //     const usersSnapshot = await getDocs(collection(db, 'users1'));
  //     const userList = usersSnapshot.docs
  //       .map(doc => ({ ...doc.data(), id: doc.id }))
  //       .filter(user => userIds.has(user.id));
      
  //     setUsers(userList);
  //     setActiveUser(userList[0]);
  //   };
  //   fetchUsers();
  // }, [currentUserId]);
  useEffect(() => {
    console.log('Users:', users);
    console.log('Active User:', activeUser);
  }, [users, activeUser]);
  

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUserId) return;

      // Create a query to get users the current user has chatted with
      const q = query(
        collection(db, 'messages'),
        where('senderId', '==', currentUserId)
      );
      const querySnapshot = await getDocs(q);
      const userIds = new Set(
        querySnapshot.docs.map(doc => doc.data().receiverId)
      );

      const q2 = query(
        collection(db, 'messages'),
        where('receiverId', '==', currentUserId)
      );
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.docs.forEach(doc => userIds.add(doc.data().senderId));

      // Fetch user details for these userIds
      const userList = await Promise.all(Array.from(userIds).map(async id => {
        const userDoc = await getDoc(doc(db, 'users1', id));
        return { ...userDoc.data(), id: userDoc.id };
      }));

      setUsers(userList);
      setActiveUser(userList[0]);
    };

    fetchUsers();
  }, [currentUserId]);

  useEffect(() => {
    const fetchUserToChatWith = async () => {
      if (userId) {
        const userDoc = await getDoc(doc(db, 'users1', userId));
        if (userDoc.exists()) {
          setActiveUser({ ...userDoc.data(), id: userDoc.id });
        }
      }
    };
    fetchUserToChatWith();
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
        collection(db, 'messages'),
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
      await addDoc(collection(db, 'messages'), {
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
