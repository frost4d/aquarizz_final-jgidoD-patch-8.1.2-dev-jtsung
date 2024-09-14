import {
  Box,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import "./MarketItem.css";
import {
  Navigate,
  useNavigate,
  useParams,
  Link,
  useLocation,
} from "react-router-dom";
const MarketItem = () => {
  const { postId } = useParams();
  const itemModal = useDisclosure();
  console.log(postId);
  return (
    <>
      <Modal isOpen={itemModal.isOpen} onClose={itemModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>this is item</ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default MarketItem;
