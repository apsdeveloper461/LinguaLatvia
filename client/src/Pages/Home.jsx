import React, { useEffect, useState } from 'react';
import avatar from "../assets/woman.svg";
import books from "../assets/books.svg";
import fillBlanks from "../assets/fillBlanks.png";
import puzzleMatch from "../assets/puzzleMatch.png";
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { auth, firebaseDb } from '../config/firebase'; // Import auth and firebaseDb from firebase config
import { doc, getDoc } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(''); // State to store user's name

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser; // Get current user
        if (user) {
          const userDoc = await getDoc(doc(firebaseDb, 'users', user.uid)); // Fetch user document
          if (userDoc.exists()) {
            // console.log(userDoc.data())
            setUserName(userDoc.data().fullName); // Set user's name
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUserName();
  }, []);

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className=" min-h-screen w-full flex flex-col items-center py-6 space-y-4 px-4 md:mt-7">
      {/* Greeting Card */}
      <div className="w-full max-w-md bg-[#136EA3] text-white rounded-[2rem] p-4 py-7 flex items-center space-x-4 shadow-custom border-2 border-black">
        <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full " />
        <div>
          <h2 className="text-lg font-semibold">Hey {userName || 'User'} <span role="img" aria-label="wave">👋</span></h2>
          <p className="text-sm text-[#FFFFFFA3]">Ready To Practice Latvian today?</p>
        </div>
      </div>

      {/* Progress Quiz */}
      <div className="w-full max-w-md bg-[#4DD0E18A] rounded-[2rem] border border-black p-6 shadow-custom flex items-center justify-between">
        <div>
        <h3 className="text-2xl font-semibold">Latvian Practice</h3>
        <p className="text-sm">Read Latvian text and listen to its pronunciation for better learning.</p>
          <button onClick={() => { navigate("/game01") }} className="mt-5 cursor-pointer py-2 bg-[#7CA7F2FA] rounded-full sm:px-10 px-5 shadow hover:bg-[#7CA7F2] hover:font-semibold transition">
            Start Reading
          </button>
        </div>
        <img
          src={books}
          alt="Books"
          className="sm:w-26 sm:h-26 h-20 w-20 object-contain"
        />
      </div>

      {/* Fill in the Blanks */}
      <div className="w-full max-w-md bg-[#4DD0E18A] rounded-[2rem] border border-black p-6 shadow-custom flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Fill in the Blanks</h3>
          <p className="text-sm">
            Fill in the blanks with the correct words to complete the sentences.
            <br />
          </p>
          <button onClick={() => { navigate("/game02") }} className="mt-5 cursor-pointer py-2 bg-[#7CA7F2FA] rounded-full sm:px-10 px-5 shadow hover:bg-[#7CA7F2] hover:font-semibold transition">
           Now Practice 
          </button>
        </div>
        <img
          src={fillBlanks}
          alt="Fill in the Blanks"
          className="sm:w-26 sm:h-26 h-20 w-20 object-contain"
        />
      </div>

      {/* Match the Words */}
<div className="w-full max-w-md bg-[#FFD54F8A] rounded-[2rem] border border-black p-6 shadow-custom flex items-center justify-between">
  <div>
    <h3 className="text-2xl font-semibold">Match the Words</h3>
    <p className="text-sm">
      Match the Latvian words with their English equivalents.
      <br />
    </p>
    <button onClick={() => { navigate("/game03") }} className="mt-5 cursor-pointer py-2 bg-[#FFAB40FA] rounded-full sm:px-10 px-5 shadow hover:bg-[#FFAB40] hover:font-semibold transition">
      Start Matching
    </button>
  </div>
  <img
    src={puzzleMatch}
    alt="Match the Words"
    className="sm:w-26 sm:h-26 h-20 w-20 object-contain"
  />
</div>
    </div>

    
  );
};

export default Home;