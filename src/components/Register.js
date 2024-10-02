import "./Register.css";
import {
  Box,
  Flex,
  FormControl,
  Input,
  FormLabel,
  Button,
  Text,
  Heading,
  Stack,
  InputGroup,
  InputLeftAddon,
  useToast,
  useDisclosure,
} from "@chakra-ui/react";
import { Form, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "./context/AuthContext";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, storage, auth } from "../firebase/firebaseConfig";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  updateProfile,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
} from "firebase/auth";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";

const Register = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { createUser, user } = UserAuth();
  const [phoneNumber, setPhoneNumber] = useState();
  const [verification, setVerification] = useState();
  const [otp, setOtp] = useState();
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(false);
  const [userPhoto, setUserPhoto] = useState();
  const navigate = useNavigate();
  const toast = useToast();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [email, setEmail] = useState();
  const [isVerified, setIsVerified] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // handle passwordless sign in using email link
  const actionCodeSettings = {
    url: "http://localhost:3000",
    handleCodeInApp: true,
  };
  useEffect(() => {
    const email = window.localStorage.getItem("emailForSignIn");

    if (!email) {
      console.log("No email found in local storage.");
      // setLoading(false);
      return;
    }

    // Confirm the sign-in link is valid and complete the sign-in
    if (isSignInWithEmailLink(auth, window.location.href)) {
      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn"); // Clean up
          navigate("/"); // Redirect after successful sign-in
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }, [navigate]);
  const handleSendOtp = () => {
    const otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const data = { user_email: email, otp: otpNumber };
    window.localStorage.setItem("otpCode", otpNumber);
    try {
      setLoading(true);
      emailjs.send(
        "service_mr8iwrn",
        "template_l9pcy7b",
        data,
        "NPe_0DyLrlq0ymvL9"
      );
      toast({
        title: "OTP has been sent!",
        description: "Kindly check your inbox for the verification code.",
        status: "success",
        duration: 1500,
        position: "top",
      });
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleVerifyOtp = () => {
    const otpCode = window.localStorage.getItem("otpCode");
    if (otpCode === otp) {
      setIsVerified(true);
      Swal.fire({
        title: "Nice!",
        text: "Your email is now verified!",
        icon: "success",
      });
    } else {
      setIsVerified(false);
    }
    setIsClicked(true);
  };

  useEffect(() => {
    if (isVerified) {
      console.log("");
    } else {
      console.log("");
    }
  }, [isVerified]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    setUserPhoto(file);

    try {
      const storageRef = ref(storage, `profileImages/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoUrl(url);
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  };

  const handleRegister = async (data) => {
    try {
      const { user } = await createUser(data.email, data.password);
      toast({
        position: "top",
        status: "success",
        title: "You are now registered!.",
        description: "Your account is successfully created.",
        duration: 3000,
      });

      let photoURL = null;
      if (photoUrl) {
        photoURL = photoUrl;
      }
      await setDoc(doc(db, "users1", user.uid), {
        email: data.email,
        name: data.name,
        password: data.password,
        userID: user.uid,
        dateCreated: Date.now(),
        createdAt: serverTimestamp(),
        location: data.location,
        phoneNumber: data.phoneNumber,
        profileImage: photoURL,
      });
      // user.updateProfile({ displayName: data.name });
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          return toast({
            position: "top",
            status: "error",
            title: "Can't create account.",
            description: "Sorry, email is already in use.",
            duration: 4000,
          });
        case "auth/quota-exceeded":
          return toast({
            position: "top",
            status: "error",
            title: "Sorry email link not available.",
            description: "Please proceed to 'login' then verify your email.",
            duration: 4000,
          });
      }
    } finally {
      await sendSignInLinkToEmail(auth, data.email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", data.email);
      toast({
        description: "A sign-in link has been sent to your email.",
        status: "success",
        duration: 3000,
        position: "top",
      });
      // await sendEmailVerification(user.user);
    }

    reset();
  };

  // const sendOTP = async () => {
  //   try {
  //     const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {});
  //     console.log(phoneNumber);
  //     // recaptcha.render()
  //     const confirmation = await signInWithPhoneNumber(
  //       auth,
  //       `+63${phoneNumber}`,
  //       recaptcha
  //     );
  //     if (!/^\+63\d{10}$/.test(phoneNumber)) {
  //       console.log("Invalid phone number format. Please check the number.");
  //       return;
  //     }
  //     setVerification(confirmation);
  //     console.log(confirmation);
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // };

  // const verifyOTP = async () => {
  //   try {
  //     const data = await verification.confirm(otp);
  //     console.log(data);
  //   } catch (err) {
  //     console.log(err.message);
  //   }
  // };

  const buttonVariants = {
    initial: {
      scale: 1,
      backgroundColor: "#4CAF50",
    },
    clicked: {
      scale: 1.2,
      backgroundColor: "#f44336", // Red for failed verification
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
      },
    },
    verified: {
      scale: 1.2,
      backgroundColor: "#00C853", // Green for success verification
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 20,
      },
    },
  };
  return (
    <>
      <Box h="100vh" w="100vw">
        <Flex align="center" justify="center" h="100%" w="100%">
          <Flex
            flexDirection="column"
            border="1px solid #e1e1e1"
            w="30em"
            p="16px 32px"
          >
            <Heading size="md" mb="12px">
              Register
            </Heading>

            <form
              className="registerForm"
              onSubmit={handleSubmit(handleRegister)}
            >
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Flex gap={2}>
                  <Input
                    type="email"
                    {...register("email", {
                      required: true,
                      onChange: (e) => {
                        setEmail(e.target.value);
                      },
                    })}
                    aria-invalid={errors.email ? "true" : "false"}
                  />

                  <Button onClick={handleSendOtp}>Send OTP</Button>
                </Flex>
                {errors.email?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Email is required
                  </p>
                )}
              </FormControl>
              <FormControl>
                <Flex gap={2}>
                  <Input
                    w="50%"
                    {...register("otp", {
                      required: true,
                      onChange: (e) => {
                        setOtp(e.target.value);
                      },
                    })}
                  />

                  <Button
                    isDisabled={isVerified}
                    isLoading={loading}
                    w="50%"
                    onClick={handleVerifyOtp}
                  >
                    {!isVerified ? "Verify" : "Verified"}
                  </Button>
                </Flex>
                {errors.otp?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Email is required
                  </p>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Name(LN,FN,MI)</FormLabel>
                <Input
                  type="text"
                  {...register("name", {
                    required: true,
                  })}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Name is required
                  </p>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  {...register("location", {
                    required: true,
                  })}
                  aria-invalid={errors.location ? "true" : "false"}
                />
                {errors.location?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Location is required
                  </p>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Stack>
                  <InputGroup>
                    <InputLeftAddon children="+63" />
                    <Input
                      type="number"
                      // maxLength={10}
                      {...register("phoneNumber", {
                        required: true,
                        minLength: {
                          value: 10,
                          message: "Please input correct phone number.",
                        },
                        maxLength: {
                          value: 10,
                          message: "Please input correct phone number.",
                        },
                        onChange: (e) => {
                          if (e.target.value.length > 10) {
                            e.target.value = e.target.value.slice(0, 10);
                          }
                          setPhoneNumber(e.target.value);
                        },
                      })}
                      aria-invalid={errors.phoneNumber ? "true" : "false"}
                    />
                    {/* <Button onClick={sendOTP}>Send OTP</Button> */}
                  </InputGroup>
                </Stack>
                {errors.phoneNumber?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Phone Number is required
                  </p>
                )}
                {errors.phoneNumber && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    {errors.phoneNumber.message}
                  </p>
                )}
              </FormControl>
              {/* <Flex gap="1">
                <Input
                  onChange={(e) => {
                    setOtp(e.target.value);
                  }}
                  {...register("otp", {
                    required: true,
                    maxLength: 6,
                    minLength: "6",
                  })}
                />

                <Button onClick={verifyOTP}>Verify</Button>
                {errors.otp?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    OTP is required
                  </p>
                )}
              </Flex> */}
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  {...register("password", {
                    required: true,
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters.",
                    },
                  })}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {errors.password?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Password is required
                  </p>
                )}
                {errors.password && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    {errors.password.message}
                  </p>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  {...register("confirmPassword", {
                    required: true,
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters.",
                    },
                    validate: (val) => {
                      if (watch("password") !== val) {
                        return "Password do not match!";
                      }
                    },
                  })}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                {errors.confirmPassword?.type === "required" && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    Confirm Password is required
                  </p>
                )}
                {errors?.confirmPassword && (
                  <p style={{ color: "#d9534f", fontSize: "12px" }}>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </FormControl>
              {/* RECAPTCHA CONTAINER */}
              <Box id="recaptcha" textAlign="center"></Box>
              <label className="label" for="photo-upload">
                <Text fontSize="sm">Add Profile Picture </Text>
              </label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handlePhotoChange}
                // {...register("userPhoto", {
                //   // required: true,
                //   onChange: (e) => {
                //     handlePhotoChange(e);
                //   },
                // })}
              />
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="Profile"
                  style={{ maxWidth: "100px" }}
                />
              )}
              <Button bg="#ffc947" w="100%" type="submit">
                Register
              </Button>
            </form>
            <Box mt="12px" w="100%">
              <Text>Already a member?</Text>
              <Link to="/">
                <Button variant="ghost" w="100%">
                  Login
                </Button>
              </Link>
            </Box>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};
export default Register;
