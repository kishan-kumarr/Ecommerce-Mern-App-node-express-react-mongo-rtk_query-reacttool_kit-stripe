
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import toast from "react-hot-toast";
import { auth } from "../firebase";
import { useLoginMutation } from "../redux/api/userAPI";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { MessageResponse } from "../types/api-types";

const Login = () => {

  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");

  const [login] = useLoginMutation();

  const loginHandler = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const { user } = await signInWithPopup(auth, provider);

        const res = await login({
          _id: user?.uid!,
          name: user?.displayName!,
          email: user?.email!,
          role: "user",
          gender,
          dob,
          photo: user?.photoURL!
        })

        if("data" in res){
          toast.success(res?.data?.message);
        } else {
          const error = res?.error as FetchBaseQueryError;
          const message = (error?.data as MessageResponse).message;
          toast.error(`${message}`);
        }
        
    } catch (error) {
        toast.error(`Sign In Failed`);
    }
  }
 
  return (
    <div className="login">
      <main>
        <h1 className="heading">Login</h1>

        <div>
          <label>Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} required={true}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>  

        <div>
          <label>Date of birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required= {true}
          />
        </div>

        <div>
          <p>Already Signed In Once</p>
          <button onClick={ loginHandler }>
            <FcGoogle /> <span>Sign in with Google</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Login;
