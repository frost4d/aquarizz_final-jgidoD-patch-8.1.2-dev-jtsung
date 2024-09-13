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
  //   const accountSid = "AC80a5dfe1970560bc6b823ed01bbb3135";
  //   const authToken = "e99491db92090500f6c792769cd6d3e3";
  //   const client = twilio(accountSid, authToken);
  //   const handleSendOtp = async (body) => {
  //     let msgOptions = {
  //       from: accountSid,
  //       to: number,
  //       body,
  //     };
  //     client;
  //     try {
  //       const message = await client.messages.create(msgOptions);
  //       console.log(message);
  //     } catch (err) {
  //       console.log(err.message);
  //     }
  //   };

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
