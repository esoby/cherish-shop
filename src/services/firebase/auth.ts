import { auth, db } from "@/firebase";
import { SignUpFormFields } from "@/types/AuthFormFields";
import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithRedirect,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

type LoginInput = {
  email: string;
  password: string;
};

// 로그인
export const signIn = async ({ email, password }: LoginInput) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error: unknown) {
    const { code } = error as FirebaseError;
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/email-already-in-use":
      case "auth/weak-password":
      case "auth/invalid-email":
      case "auth/invalid-credential":
        alert("이메일 혹은 비밀번호가 일치하지 않습니다.");
        break;
      case "auth/network-request-failed":
        alert("네트워크 연결에 실패하였습니다.");
        break;
      case "auth/internal-error":
        alert("잘못된 요청입니다.");
        break;
      default:
        alert("로그인에 실패하였습니다.");
    }
    return false;
  }
};

// 구글 소셜 로그인
export const signInWithGoogle = async (event: { preventDefault: () => void }) => {
  event.preventDefault();

  // 구글 로그인 페이지로 리다이렉트
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
};

// 소셜 로그인 후 유저 데이터 처리
export const handleGoogleAuthRedirectResult = async () => {
  const userCredential = await getRedirectResult(auth);

  if (!userCredential?.user) {
    // 새 로그인 정보가 존재하지 않는 경우 함수 실행 X
    return false;
  }
  const { uid, displayName, email } = userCredential.user;

  const collectionRef = collection(db, "users");
  const docRef = doc(collectionRef, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // 이미 가입된 회원
    await updateDoc(docRef, { updatedAt: serverTimestamp() });
  } else {
    // 첫 로그인, store에 데이터 저장
    const newUser = {
      userId: uid,
      nickname: displayName ? displayName : "",
      email: email ? email : "",
      isSeller: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, newUser);
  }
  return true;
};

// 회원가입
export const signUp = async ({ email, name, password, isSeller }: SignUpFormFields) => {
  // 이메일 중복 확인
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) return "duplicate email";

  try {
    // create firebase users
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const newUser = {
      userId: userCredential.user.uid,
      email: email,
      isSeller: isSeller,
      nickname: name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const collectionRef = collection(db, "users");
    await addDoc(collectionRef, newUser);

    return "complete";
  } catch (error: unknown) {
    const { code } = error as FirebaseError;
    switch (code) {
      case "auth/network-request-failed":
        alert("네트워크 연결에 실패하였습니다.");
        break;
      case "auth/internal-error":
        alert("잘못된 요청입니다.");
        break;
      default:
        alert("회원가입에 실패하였습니다.");
    }
    return "";
  }
};
