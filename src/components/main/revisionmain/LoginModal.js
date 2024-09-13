import {
  Modal,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalFooter,
  Text,
  Input,
  FormLabel,
  Box,
  Button,
  useDisclosure,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { auth } from "../../../firebase/firebaseConfig";
import {
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
} from "firebase/auth";
import { UserAuth } from "../../context/AuthContext";
import WelcomeModal from "./components/WelcomeModal";
import { motion } from "framer-motion";

const slideVariants = {
  hidden: { y: "-2vh" }, // Start offscreen (right)
  visible: { y: 0 }, // Slide to visible
  exit: { y: "-5vh" }, // Slide offscreen (left)
};

const LoginModal = (props) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, userProfile } = UserAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const loginModal = useDisclosure();
  const primaryColor = "#FFC947";
  const [showFirst, setShowFirst] = useState(true);

  const {
    register: login,
    handleSubmit: loginSubmit,
    formState: { errors2 },
    reset: resetLogin,
  } = useForm();

  const {
    register: forgotPass,
    handleSubmit: forgotPassSubmit,
    formState: { errors3 },
    reset: resetForgotPass,
  } = useForm();

  const handleLogin = async (data) => {
    setIsLoading(true);
    console.log(data);
    try {
      const userCred = await signIn(data.email, data.password);
      setTimeout(() => {
        toast({
          description: "Welcome back!!!",
          status: "success",
          duration: 5000,
          position: "top",
        });
      }, [1500]);
      resetLogin();
    } catch (err) {
      switch (err.code) {
        case "auth/invalid-credential":
          toast({
            title: "Invalid Credentials",
            description: "Please check your email and password",
            status: "error",
            duration: 5000,
            position: "top",
          });
          break;
      }
    } finally {
      navigate(window.location.pathname);

      setIsLoading(false);
    }
  };

  const handleForgotPass = async (data) => {
    try {
      await sendPasswordResetEmail(auth, data.emailForgot);
      toast({
        title: "Nice!",
        description: "Password reset email sent! Kindly check your inbox.",
        status: "success",
        duration: 2000,
        position: "top",
      });
    } catch (err) {
      switch (err.message) {
        case "Firebase: Error (auth/missing-email).":
          toast({
            title: "Oops!",
            description: "Looks like you entered a wrong email.",
            status: "error",
            duration: 2000,
            position: "top",
          });
          break;
      }
      console.log(err.message);
    } finally {
      setShowFirst(true);
      resetForgotPass();
    }
  };

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={props.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Login</ModalHeader>
          <ModalBody>
            {showFirst ? (
              <motion.div
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "spring", stiffness: 200 }}
              >
                <form onSubmit={loginSubmit(handleLogin)}>
                  <FormLabel>
                    <Text>Email</Text>
                    <Input
                      type="email"
                      {...login("email", {
                        required: true,
                      })}
                      aria-invalid={errors2?.email ? "true" : "false"}
                    />
                  </FormLabel>
                  <FormLabel>
                    <Text>Password</Text>
                    <Input
                      type="password"
                      {...login("password", {
                        required: true,
                      })}
                      aria-invalid={errors2?.password ? "true" : "false"}
                    />
                  </FormLabel>
                  <FormLabel>
                    <Button
                      isLoading={isLoading}
                      w="100%"
                      type="submit"
                      bg={primaryColor}
                      isDisabled={isVerified}
                    >
                      Login
                    </Button>
                  </FormLabel>
                </form>

                <Flex justify="space-between" align="center">
                  <Box>
                    <Button
                      onClick={() => setShowFirst(false)}
                      size="sm"
                      variant="link"
                    >
                      Forgot Password
                    </Button>
                  </Box>
                  <Flex justify="end" align="center">
                    <Text fontSize="sm">Not a member?</Text>
                    <Link to="/register">
                      <Button variant="ghost" ml="12px">
                        Register
                      </Button>
                    </Link>
                  </Flex>
                </Flex>
              </motion.div>
            ) : (
              <motion.div
                variants={slideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "spring", stiffness: 100 }}
              >
                <Box p={8} textAlign="center">
                  <form onSubmit={forgotPassSubmit(handleForgotPass)}>
                    <Box w="100%">
                      <Input
                        type="email"
                        placeholder="Email"
                        {...forgotPass("emailForgot", { required: true })}
                        aria-invalid={errors3?.emailForgot ? "true" : "false"}
                      />
                      <Button
                        type="submit"
                        w="100%"
                        mt="12px"
                        bg={primaryColor}
                      >
                        Send reset email
                      </Button>
                    </Box>
                  </form>

                  <Button w="100%" mt="12px" onClick={() => setShowFirst(true)}>
                    Back to Login
                  </Button>
                </Box>
              </motion.div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default LoginModal;
