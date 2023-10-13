import { Magic } from "magic-sdk";
import { SolanaExtension } from "@magic-ext/solana";
import { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useRouter } from "next/router";
import { userState } from "@/store/atoms/userState";
import { useSetRecoilState, useRecoilValue } from "recoil";
import {
  userIdSelector,
  publicAddressSelector,
} from "@/store/selectors/userDetailsSelector";

const MAGIC_LINK_API_KEY = "pk_live_6A10D6F34E44BACC"; // publishable API key,access restricted from backend
const RPC_URL = process.env.SOLANA_RPC_URL || "";
// const rpcUrl = "https://api.devnet.solana.com";
let magic: any = null;

if (typeof window !== "undefined") {
  magic = new Magic(MAGIC_LINK_API_KEY || "", {
    extensions: [
      new SolanaExtension({
        rpcUrl: RPC_URL,
      }),
    ],
  });
}

export default function Navbar() {
  // const userId = useRecoilValue(userIdSelector);
  // const publicAddress = useRecoilValue(publicAddressSelector)
  const user = useRecoilValue(userState);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  // const [publicAddress, setPublicAddress] = useState("");
  // const [userMetadata, setUserMetadata] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  let metadata: any = null;
  // const router = useRouter();
  const setUserState = useSetRecoilState(userState);

  useEffect(() => {
    magic.user.isLoggedIn().then(async (magicIsLoggedIn: boolean) => {
      setIsLoggedIn(magicIsLoggedIn);
      if (magicIsLoggedIn) {
        metadata = await magic.user.getMetadata();
        // setPublicAddress(metadata.publicAddress || "");
        // setUserMetadata(metadata);

        const idToken = await magic.user.getIdToken();

        // Format the cookie string
        const cookieValue = `token=${idToken}; path=/`;
        // Set the cookie
        document.cookie = cookieValue;

        console.log("metadata from useEffect in navbar....", metadata); //remove later
      }
    });
  }, [isLoggedIn]);

  const handleLogin = async () => {
    console.log("handling log in....");

    try {
      const response = await magic.auth.loginWithEmailOTP({ email });
      const metadata = await magic.user.getMetadata();
      const idToken = await magic.user.getIdToken();

      const cookieValue = `token=${idToken}; path=/`;
      document.cookie = cookieValue;

      const createUserResponse = await axios({
        method: "POST",
        url: "/api/user/createUser",
        data: {
          id: metadata.issuer,
          email: email,
          publicAddress: metadata.publicAddress,
        },
      });

      if (createUserResponse) {
        setUserState({
          isLoading: false,
          email: createUserResponse.data.user.email,
          role: "user",
          id: createUserResponse.data.user.id,
          username: createUserResponse.data.user.username,
          isVerified: createUserResponse.data.user.isVerified,
          isActivated: createUserResponse.data.user.isActivated,
          likes: createUserResponse.data.user.likes,
          followers: createUserResponse.data.user.followers,
          followees: createUserResponse.data.user.followees,
          publicAddress: createUserResponse.data.user.publicAddress,
        });
        setIsLoggedIn(true);
      }

      console.log("CreateUserResponse is......", createUserResponse);

      console.log("logged in successfully with email...", email);
      console.log("Metadata is....", metadata);
      console.log("respnse is ...", response);
      setIsModalOpen(false);
    } catch (e) {
      alert("Error logging in. Please try later");
      console.log(e);
    }
  };

  const handleLogout = async () => {
    console.log("logging out...");
    await magic.user.logout();

    const cookieValue = `token=; path=/`;
    document.cookie = cookieValue;

    console.log("User state metadata after loging out....", user);

    setUserState({
      isLoading: true,
      email: null,
      role: null,
      id: null,
      username: null,
      isVerified: null,
      isActivated: null,
      likes: null,
      followers: null,
      followees: null,
      publicAddress: null,
    });
    setIsLoggedIn(false);
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return isLoggedIn ? (
    <div className="flex justify-between p-5">
      <div className="font-extrabold text-xl">commentary.</div>
      <div className="flex justify-normal">
        <div className="flex items-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(user.publicAddress || "");
              alert("Copied address to clipboard");
            }}
            id="publicAddress"
            className="bg-[#212121] m-2 p-2 rounded-lg hover:cursor-pointer hover:bg-[#2d2d2d]"
          >
            {user.publicAddress?.slice(0, 4)}...{user.publicAddress?.slice(-4)}
          </button>
        </div>
        <div className="flex items-center">
          <button className="bg-[#212121] m-2 p-2 rounded-lg hover:cursor-pointer hover:bg-[#2d2d2d]">
            Dashboard
          </button>
        </div>
        <button
          className="bg-amber-600 rounded-xl p-2 m-2"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  ) : (
    <div className="flex justify-between p-5">
      <div className="font-extrabold text-xl">commentary.</div>
      <button
        className="bg-amber-600 rounded-xl p-3"
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        Sign In
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Login Modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            maxWidth: "400px",
            padding: "20px",
            background: "white",
          },
        }}
        ariaHideApp={false}
      >
        <h2 className="text-lg font-bold mb-4 text-black">Login</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-amber-600 text-black"
            id="email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <button
          className="bg-amber-600 text-white rounded-lg p-3 w-full"
          onClick={handleLogin}
        >
          Log In
        </button>
      </Modal>
    </div>
  );
}

// export async function getServerSideProps() {
//   const magicLinkApiKey = process.env.MAGIC_LINK_API_KEY || "";

//   return {
//     props: {
//       magicLinkApiKey,
//     },
//   };
// }
