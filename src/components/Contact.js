import {
  FormControl,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  FormLabel,
  Input,
  ModalBody,
  ModalFooter,
  Button,
  ModalCloseButton,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";

const Contact = (props) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleSendFeedback = (data) => {
    setIsLoading(true);
    console.log("clicked");
    console.log(data);
    try {
      emailjs.send(
        "service_mr8iwrn",
        "template_s82d8as",
        data,
        "NPe_0DyLrlq0ymvL9"
      );
      toast({
        description: "sent",
        status: "success",
        duration: 1500,
        position: "top",
      });
    } catch (err) {
      console.log(err.message);
    } finally {
      setIsLoading(false);
    }

    reset();
  };
  return (
    <>
      <Modal
        isOpen={props.isOpen}
        onClose={props.onClose}
        initialFocusRef={props.initialRef}
        finalFocusRef={props.finalRef}
        blockScrollOnMount={false}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Let me know your feedback!</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(handleSendFeedback)}>
            <ModalBody>
              <FormControl>
                <FormLabel>Email:</FormLabel>
                <Input
                  type="email"
                  name="user_email"
                  {...register("user_email", {
                    required: true,
                  })}
                />
                {errors.user_email?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Email is required
                  </p>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Name:</FormLabel>
                <Input
                  {...register("name", {
                    required: true,
                  })}
                />
                {errors.name?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Name is required
                  </p>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Subject:</FormLabel>
                <Input
                  name="subject"
                  {...register("subject", {
                    required: true,
                  })}
                />
                {errors.subject?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Subject is required
                  </p>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>Message</FormLabel>
                <Textarea
                  {...register("message", {
                    required: true,
                  })}
                />
                {errors.message?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Message is required
                  </p>
                )}
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button isLoading={isLoading} type="submit" variant="outline">
                Send
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
export default Contact;
