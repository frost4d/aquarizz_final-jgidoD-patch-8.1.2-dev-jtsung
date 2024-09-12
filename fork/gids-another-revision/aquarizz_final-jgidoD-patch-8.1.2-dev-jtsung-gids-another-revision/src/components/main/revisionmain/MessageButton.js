import React from 'react';
import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'react-feather';

const MessageButton = ({ userId }) => {
  const navigate = useNavigate();

  const handleMessageClick = () => {
    // Navigate to a chat page, passing the userId as a parameter
    navigate(`/chatMessage/${userId}`);
  };

  return (
    <Button
      onClick={handleMessageClick}
      leftIcon={<MessageCircle />}
      colorScheme="blue"
      ml={2} // Adds margin-left to separate it from the Follow button
    >
      Message
    </Button>
  );
};

export default MessageButton;
