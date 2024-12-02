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
  Image,
  Progress
} from "@chakra-ui/react";
import { FFmpeg } from '@ffmpeg/ffmpeg';
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

const MAX_VIDEO_SIZE_MB = 100; // Maximum size in MB
const MAX_VIDEO_WIDTH = 1280; // 720p width (HD)

const AddDiscover = (props) => {
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
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 

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
    setIsImageReady(true);

    });
    console.log(file);
  };

  // const handleVideoChange = async (e) => {
  //   const video = e.target.files[0];
  //   setVideoFile(video);

  //   const videoRef = ref(
  //     storage,
  //     `postVideos/${video.name + "&" + userProfile.name}`
  //   );
  //   await uploadBytes(videoRef, video);
  //   const url = await getDownloadURL(videoRef);
  //   setVideoUrl(url);
  //   setIsVideoReady(true);
  // };

  const handleVideoChange = async (e) => {
    const video = e.target.files[0];
    const videoSizeMB = video.size / (1024 * 1024); // Size in MB

    if (videoSizeMB > MAX_VIDEO_SIZE_MB) {
      alert(`File size exceeds ${MAX_VIDEO_SIZE_MB}MB. Please upload a smaller video.`);
      return;
    }

    const videoElement = document.createElement('video');
    videoElement.src = URL.createObjectURL(video);
    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => resolve();
    });

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;

    // Check if the video resolution is higher than 720p (1280px width)
    if (videoWidth > MAX_VIDEO_WIDTH) {
      // Resize video to 720p using ffmpeg
      alert('The video resolution is higher than 720p, resizing to 720p...');
      const resizedVideo = await resizeVideoTo720p(video);
      setVideoFile(resizedVideo);
    } else {
      setVideoFile(video);
    }

    // Create a reference for video upload
    const videoRef = ref(storage, `postVideos/${video.name + "&" + userProfile.name}`);
    
    // Use uploadBytesResumable to track upload progress
    const uploadTask = uploadBytesResumable(videoRef, video);

    uploadTask.on('state_changed', 
      (snapshot) => {
        // Get upload progress percentage
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress); // Update progress state
      }, 
      (error) => {
        console.error('Error uploading video:', error);
        alert('Error uploading video. Please try again.');
      },
      async () => {
        // Get video URL after successful upload
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setVideoUrl(url);
        setIsVideoReady(true);
      }
    );

    // // Proceed with the upload if the file is valid
    // const videoRef = ref(storage, `postVideos/${video.name + "&" + userProfile.name}`);
    // await uploadBytes(videoRef, video);
    // const url = await getDownloadURL(videoRef);
    // setVideoUrl(url);
    // setIsVideoReady(true);
  };

  const resizeVideoTo720p = async (videoFile) => {
    const ffmpeg = new FFmpeg({ log: true });
  
    await ffmpeg.load(); // Load the ffmpeg.wasm library
  
    const reader = new FileReader();
    const videoData = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsArrayBuffer(videoFile);
    });
  
    // Use the video as input to ffmpeg
    const fileName = "input.mp4";
    ffmpeg.FS('writeFile', fileName, new Uint8Array(videoData));
  
    // Run ffmpeg command to resize the video to 720p
    await ffmpeg.run('-i', fileName, '-vf', 'scale=1280:-1', '-c:a', 'aac', '-b:a', '192k', '-y', 'output.mp4');
  
    // Get the result and convert it back to a Blob
    const outputData = ffmpeg.FS('readFile', 'output.mp4');
    const resizedVideoBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
  
    return resizedVideoBlob;
  };
  

  const handleSubmitPost = async (data) => {
    const obj = {
      authorName: userProfile.name,
      authorID: user?.uid,
      // postTitle: data.title,
      postContent: data.text,
      postImage: file ? imageUrl : "", // Optional chaining to avoid null value
      postVideo: videoFile ? videoUrl : "",
      // tag: data.tag,
      createdAt: data.createdAt || Date.now(),
    };
    try {
      setIsLoading(true);
      await addDoc(collection(db, "discover"), obj);
      // await createPost(obj);
      toast({
        title: "Post Created.",
        description: "Post successfully published.",
        status: "success",
        duration: 5000,
        position: "top",
      });
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        window.location.reload();
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
                {/* <Box mb={4}>
                  <FormLabel>Title</FormLabel>
                  <Input {...register("title", { required: true })} />
                  {errors.title && <Text color="red">Title is required</Text>}
                </Box> */}

                <Box>
                  <Textarea
                    placeholder="Text"
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
                  {imageUrl && (
                    <Box mt={2}>
                      <Text>Video Preview:</Text>
                      <Image
                        width="100%"
                        controls
                        src={imageUrl}
                        style={{ marginTop: "10px" }}
                      />
                      <Text mt={2} color={isImageReady ? "green" : "red"}>
                        {isImageReady ? "Image ready to publish!" : "Processing video..."}
                      </Text>
                    </Box>
                  )}
                </Box>
                <Box p="12px 0">
                  <Text>Upload Video</Text>
                  <Input
                    className="inputFileDiscover"
                    type="file"
                    accept=".mp4, .mov, .avi"
                    multiple={false}
                    onChange={handleVideoChange}
                  />
                  {videoUrl && (
                    <Box mt={2}>
                      <Text>Video Preview:</Text>
                      <video
                        width="100%"
                        height="auto"
                        controls
                        src={videoUrl}
                        style={{ marginTop: "10px", aspectRatio: "16 / 9" }}
                      />
                      <Text mt={2} color={isVideoReady ? "green" : "red"}>
                        {isVideoReady ? "Video ready to publish!" : "Processing video..."}
                      </Text>
                    </Box>
                  )}

                   {/* Show progress bar if uploading */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <Box mt={4}>
                    <Progress value={uploadProgress} size="sm" colorScheme="teal" />
                    <Text mt={2} color="teal">{Math.round(uploadProgress)}% Uploading...</Text>
                  </Box>
                )}
                </Box>
                {/* <Box>
                  <Input
                    placeholder="e.g. #tag"
                    {...register("tag", { required: true })}
                    aria-invalid={errors.tag ? "true" : "false"}
                  />
                  {errors.tag?.type === "required" && (
                    <p style={{ color: "#d9534f", fontSize: "12px" }}>
                      Tag is required
                    </p>
                  )}
                </Box> */}

                <Button
                  type="submit"
                  bg={primaryColor}
                  onClick={props.fetchData}
                  isLoading={isLoading}
                  isDisabled={!isVideoReady && videoFile} 
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
export default AddDiscover;
