import React from "react";
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "react-feather";

const MessageButton = ({ userId }) => {
  const navigate = useNavigate();

  const handleMessageClick = () => {
    navigate(`/chatMessage/${userId}`);
  };

  return (
    <Button
      onClick={handleMessageClick}
      leftIcon={<MessageCircle />}
      colorScheme="blue"
    >
      Message
    </Button>
  );
};

export default MessageButton;
