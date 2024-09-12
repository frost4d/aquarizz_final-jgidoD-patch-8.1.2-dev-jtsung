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
  useDisclosure,
  Progress,
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
import { Image, PlusSquare } from "react-feather";

const AddMarketplace = (props) => {
  const multipleUploadModal = useDisclosure();
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
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState();
  const [mediaURLs, setMediaURLs] = useState();
  const [progress, setProgress] = useState();
  const mediaRef = useRef();
  const handleMediaChangeMultiple = (e) => {
    try {
      const selectedFiles = [...e.target.files];
      setFiles(selectedFiles);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClickMedia = () => {
    mediaRef.current.click();
  };
  const handleUploadMediaMultiple = async () => {
    setUploading(true);
    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const storageRef = ref(
          storage,
          `marketMedia/${file.name}%%${userProfile.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(progress);
          },
          (error) => {
            console.error("Upload failed:", error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
            console.log(downloadURL);
            setMediaURLs(...downloadURL);
          }
        );
      });
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setMediaURLs(urls);
      setUploading(false);
      multipleUploadModal.onClose();
    } catch (error) {
      console.error("Error uploading media:", error);
    }
  };
  console.log(mediaURLs);
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
      postImage: mediaURLs ? [...mediaURLs] : [],
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
        postImage: mediaURLs ? [...mediaURLs] : [], // Optional chaining to avoid null value
        postTitle: data.title,
        unit: data.unit,
        street: data.street,
        barangay: data.barangay,
        city: data.city,
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

                <Box>
                  <FormLabel>Description</FormLabel>
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
                <Box>
                  <FormLabel>Location</FormLabel>
                  <Flex gap={2}>
                    <Input
                      placeholder="Floor/Unit No."
                      {...register("unit", { required: false })}
                      aria-invalid={errors.unit ? "true" : "false"}
                    />
                    {errors.unit?.type === "required" && (
                      <p style={{ color: "#d9534f", fontSize: "12px" }}>
                        Text is required
                      </p>
                    )}
                    <Input
                      placeholder="Street"
                      {...register("street", { required: false })}
                      aria-invalid={errors.street ? "true" : "false"}
                    />
                    {errors.street?.type === "required" && (
                      <p style={{ color: "#d9534f", fontSize: "12px" }}>
                        Text is required
                      </p>
                    )}
                  </Flex>
                  <Flex mt="12px" gap={2}>
                    <Input
                      placeholder="Barangay"
                      {...register("barangay", { required: false })}
                      aria-invalid={errors.barangay ? "true" : "false"}
                    />

                    {errors.barangay?.type === "required" && (
                      <p style={{ color: "#d9534f", fontSize: "12px" }}>
                        Text is required
                      </p>
                    )}
                    <Input
                      placeholder="Municipality/City"
                      {...register("city", { required: false })}
                      aria-invalid={errors.city ? "true" : "false"}
                    />

                    {errors.city?.type === "required" && (
                      <p style={{ color: "#d9534f", fontSize: "12px" }}>
                        Text is required
                      </p>
                    )}
                  </Flex>
                </Box>
                {/* <Box p="12px 0">
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
                </Box> */}
                {/* <Input
                  ref={mediaRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaChangeMultiple}
                  style={{ display: "none" }}
                /> */}
                <Flex align="center" gap={4}>
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    onClick={multipleUploadModal.onOpen}
                    isLoading={uploading}
                  >
                    <Image size={16} />
                  </Button>
                  <Progress value={progress} />
                  <Text fontWeight="500">
                    {!mediaURLs ? "Please upload a media." : "Media ready!"}
                  </Text>
                </Flex>

                <Modal
                  isOpen={multipleUploadModal.isOpen}
                  onClose={multipleUploadModal.onClose}
                >
                  <ModalOverlay />
                  <ModalContent>
                    <ModalBody>
                      <Box textAlign="center">
                        <Input
                          style={{ display: "none" }}
                          ref={mediaRef}
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleMediaChangeMultiple}
                        />
                        <Button
                          onClick={handleClickMedia}
                          rightIcon={<PlusSquare size={16} />}
                        >
                          Add Media
                        </Button>
                        <Text fontWeight="500">
                          {!files ? "0" : files.length} files are ready for
                          upload.
                        </Text>
                        {!uploading ? (
                          " "
                        ) : (
                          <Progress colorScheme="green" value={progress} />
                        )}
                        <Flex justify="end">
                          <Button
                            onClick={handleUploadMediaMultiple}
                            isLoading={uploading}
                          >
                            Add
                          </Button>
                        </Flex>
                      </Box>
                    </ModalBody>
                  </ModalContent>
                </Modal>

                <Button
                  type="submit"
                  bg={primaryColor}
                  onClick={props.fetchData}
                  isLoading={isLoading}
                  isDisabled={!mediaURLs ? true : false}
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
