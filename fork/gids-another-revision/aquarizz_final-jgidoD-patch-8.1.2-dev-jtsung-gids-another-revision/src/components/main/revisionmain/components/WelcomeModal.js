import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

const WelcomeModal = (props) => {
  const welcomeModal = useDisclosure();

  const handleClose = () => {
    setTimeout(() => {
      welcomeModal.onClose();
    }, 1500);
  };
  return (
    <>
      <Modal isOpen={props.isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody></ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default WelcomeModal;
