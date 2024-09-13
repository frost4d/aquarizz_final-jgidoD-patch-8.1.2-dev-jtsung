import {
  Box,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  Input,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { auth } from "../../../../firebase/firebaseConfig";

const VerifyEmail = (props) => {
  const verifyModal = useDisclosure();
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState();
git 
  return (
    <>
      <Modal isOpen={props.isOpen} onClose={props.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Box>
              <Input
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                }}
              />
              <Button>Send</Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default VerifyEmail;
