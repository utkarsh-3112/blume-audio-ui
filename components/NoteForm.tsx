import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { FiUploadCloud } from "react-icons/fi";
import { getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APPID,
};

if (!getApps.length) {
  initializeApp(firebaseConfig);
}

const NoteForm = (): JSX.Element => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [email, setEmail] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    setAudioFile(file || null);
    setFileError("");
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEmail(event.target.value);
    setEmailError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    // Check for required fields
    if (!audioFile) {
      setFileError("Please select an audio file.");
      return;
    }

    if (!email) {
      setEmailError("Please enter your email address.");
      return;
    }

    // Check email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      setUploading(true);

      const storage = getStorage();
      const storageRef = ref(storage, audioFile.name);
      const uploadTask = uploadBytesResumable(storageRef, audioFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setProgress(progress);
        },
        (error) => {
          // Handle unsuccessful uploads
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log("File available at ", downloadURL);
            await axios.post(
              "http://localhost:4002/api",
              {
                email_address: email,
                download_url: downloadURL,
                file_extension: audioFile.name.split(".").pop(),
                selectedOption: selectedOption,
              },
              {
                timeout: 60000 * 60,
              }
            );
          });
          setUploading(false);
          setAudioFile(null);
          setEmail("");
          setProgress(0);
        }
      );
    } catch (error) {
      // Error notification or handling
    }
  };

  return (
      <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto bg-white p-2 rounded-lg shadow-lg"
      >
        <label className="block mb-4">
          <span className="text-gray-700">Audio or Video File:</span>
          <div className="mt-1">
            <label
                htmlFor="audio-upload"
                className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-2"
            >
              Choose File
            </label>

            <input
                id="audio-upload"
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="hidden"
            />
            {fileError && <p className="text-red-500 mt-2">{fileError}</p>}
          </div>
          {audioFile && !uploading && (
              <p className="text-gray-500 mt-2 break-words">
                <span className="font-medium">Selected File:</span> {audioFile.name}
              </p>
          )}
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Email Address:</span>
          <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={handleEmailChange}
              className="mt-1 border-gray-300 rounded-md shadow-sm p-2 text-black w-full"
          />
          {emailError && <p className="text-red-500 mt-2">{emailError}</p>}
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Select Audio Type:</span>
          <div className="mt-1">
            <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm p-2 text-black w-full"
                required
            >
              <option value="">Select...</option>
              <option value="Audio Book">Audio Book</option>
              <option value="Podcast">Podcast</option>
              <option value="Song">Song</option>
            </select>
          </div>
        </label>

        <button
            type="submit"
            disabled={uploading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <FiUploadCloud className="mr-2" />
          {uploading ? "Uploading..." : "Submit"}
        </button>

        {uploading && (
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-300">
              Upload is {progress}% done
            </div>
        )}
      </form>
  );
};

export default NoteForm;
