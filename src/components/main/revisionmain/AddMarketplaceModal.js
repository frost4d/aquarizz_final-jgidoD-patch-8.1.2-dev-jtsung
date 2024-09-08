import "./AddDiscoverModal.css";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Input,
  Button,
  FormControl,
  Card,
  Textarea,
  useToast,
  Box,
  Flex,
  InputGroup,
  FormLabel,
  Text,
  Heading,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
// import { UserAuth } from "../context/AuthContext";
import { UserAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { serverTimestamp, doc, getDoc } from "firebase/firestore";
// import { db, storage } from "../../firebase/firebaseConfig";
import { db, storage } from "../../../firebase/firebaseConfig";
import { collection, addDoc, docRef } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import { CheckCircleIcon, SmallAddIcon } from "@chakra-ui/icons";
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useParams } from "react-router-dom";

const AddMarketplace = (props) => {
  const postId = useParams();
  const primaryColor = "#FFC947";
  const { createPost, user, userProfile } = UserAuth();
  const toast = useToast();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();
  // const [userProfile, setUserProfile] = useState();
  const [isLoading, setIsLoading] = useState();
  const [file, setFile] = useState();
  const [imageUrl, setImageUrl] = useState();
  const [videoFile, setVideoFile] = useState();
  const [videoUrl, setVideoUrl] = useState();

  const handleImageChange = async (e) => {
    setFile(e.target.files[0]);

    const imageRef = ref(
      storage,
      `postImages/${e.target.files[0].name + "&" + userProfile.name}`
      // `postImages/${e.target.files[0].name + "&" + userProfile.name}`
    );
    await uploadBytes(imageRef, e.target.files[0]).then((snapshot) => {
      console.log("Uploaded a blob or file!");
      console.log(snapshot);
    });
    getDownloadURL(imageRef).then((url) => {
      console.log(url);
      if (url === null) {
        console.log("error");
      }
      setImageUrl(url);
    });
  };

  const handleVideoChange = async (e) => {
    const video = e.target.files[0];
    setVideoFile(video);

    const videoRef = ref(
      storage,
      `postVideos/${video.name + "&" + userProfile.name}`
    );
    await uploadBytes(videoRef, video);
    const url = await getDownloadURL(videoRef);
    setVideoUrl(url);
  };

  const handleSubmitPost = async (data) => {
    const obj = {
      authorName: userProfile.name,
      authorID: user?.uid,
      postTitle: data.title,
      postContent: data.text,
      postImage: imageUrl ? imageUrl : "", // Optional chaining to avoid null value
      createdAt: data.createdAt || new Date().toISOString(),
      price: data.price,
    };
    try {
      setIsLoading(true);
      const docRef = await addDoc(collection(db, "marketplace"), {
        authorName: userProfile.name,
        authorID: user?.uid,
        price: data.price,
        createdAt: data.createdAt || new Date().toISOString(),
        postContent: data.text,
        postImage: file ? imageUrl : "", // Optional chaining to avoid null value
        postTitle: data.title,
      });

      console.log(docRef);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setTimeout(() => {
        toast({
          title: "Post Created.",
          description: "Post successfully published.",
          status: "success",
          duration: 5000,
          position: "top",
        });
        setIsLoading(false);
      }, 1500); // 3000ms = 3 seconds
    }
    console.log(obj);
    setFile("");
    setImageUrl("");
    setVideoFile("");
    setVideoUrl("");
    reset();
    props.onClose();
  };

  return (
    <>
      <Modal isOpen={props.isOpen} onClose={props.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <form onSubmit={handleSubmit(handleSubmitPost)}>
              <Box textAlign="center" my="24px">
                <Heading fontSize="md">Let others know what you have!</Heading>
              </Box>
              <Flex
                className="addDiscoverForm"
                flexDirection="column"
                justify="center"
              >
                <Box mb={4}>
                  <FormLabel>Title</FormLabel>
                  <Input {...register("title", { required: true })} />
                  {errors.title && <Text color="red">Title is required</Text>}
                </Box>

                <Box>
                  <FormLabel>Price</FormLabel>
                  <Input
                    type="number"
                    // placeholder="Unit Price"
                    {...register("price", { required: true })}
                    aria-invalid={errors.tag ? "true" : "false"}
                  />
                  {errors.tag?.type === "required" && (
                    <p style={{ color: "#d9534f", fontSize: "12px" }}>
                      price is required
                    </p>
                  )}
                </Box>

                <FormLabel>Description</FormLabel>
                <Box>
                  <Textarea
                    // placeholder="Text"
                    {...register("text", { required: false })}
                    aria-invalid={errors.text ? "true" : "false"}
                  />
                  {errors.text?.type === "required" && (
                    <p style={{ color: "#d9534f", fontSize: "12px" }}>
                      Text is required
                    </p>
                  )}
                </Box>
                <Box p="12px 0">
                  <Text>Upload Image</Text>
                  <Input
                    className="inputFileDiscover"
                    type="file"
                    name="file"
                    id="file"
                    accept=".jpg, .jpeg, .png"
                    // className="inputfile"
                    multiple
                    onChange={handleImageChange}
                  />
                </Box>

                <Button
                  type="submit"
                  bg={primaryColor}
                  onClick={props.fetchData}
                  isLoading={isLoading}
                >
                  Publish
                </Button>
                <Button onClick={props.onClose}>Cancel</Button>
              </Flex>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default AddMarketplace;
