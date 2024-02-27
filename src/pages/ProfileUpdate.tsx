import Loading from "@/components/Common/Loading";
import MainContainer from "@/components/Common/MainContainer";
import Modal from "@/components/Common/Modal";
import NavBar from "@/components/Common/NavBar";
import PasswordForm from "@/components/Profile/PasswordForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/interfaces/User";
import { auth } from "@/services/firebase/firebaseConfig";
import { fetchStoreDataByField, updateStoreData } from "@/services/firebase/firestore";
import { redirectIfNotAuthorized } from "@/util/redirectIfNotAuthorized";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ProfileUpdate = () => {
  const { user } = useAuth() || {};
  if (user) redirectIfNotAuthorized(user);
  const { uid } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User>();
  const [loginType, setLoginType] = useState(false);
  const { setAlert } = useAlert();

  const fetchContent = async () => {
    if (uid) {
      const data = await fetchStoreDataByField<User>("users", "userId", uid);
      setUserData(data[0]);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleChangeName = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setUserData((prev) => {
      if (prev) {
        let newData: User = { ...prev };
        newData.nickname = value;
        return newData;
      }
      return undefined;
    });
  };

  useEffect(() => {
    if (auth.currentUser?.providerData[0].providerId === "password") setLoginType(true);
  }, []);

  const handleUpdateUser = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> => {
    event.preventDefault();
    if (uid && userData) {
      await updateStoreData("users", userData?.id, { nickname: userData?.nickname });
      setAlert(true, "", "개인 정보가 수정되었습니다.");
    }
  };

  const handleChangePassword = async (data: any, reset: () => void) => {
    let email = auth.currentUser?.email ?? "";
    let currentPassword = data.password;
    let newPassword = data.newPassword;

    if (email) {
      const { user } = await signInWithEmailAndPassword(auth, email, currentPassword);
      if (user) {
        await updatePassword(user, newPassword);
        setAlert(true, "", "비밀번호가 변경되었습니다.");
        navigate(`/profile/${uid}`);
        reset();
      }
    }
  };

  if (!userData) return <Loading />;

  return (
    <>
      <Modal>
        <NavBar />
        <MainContainer>
          <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">개인 정보 수정</h2>
          {userData && (
            <div className="w-3/5 p-6 flex flex-col gap-4">
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input type="text" disabled readOnly id="email" value={userData.email} />
              </div>
              <div>
                <Label htmlFor="name">닉네임</Label>
                <Input
                  type="text"
                  id="name"
                  value={userData.nickname}
                  onChange={handleChangeName}
                />
              </div>
              <Button className="w-full" onClick={handleUpdateUser}>
                수정하기
              </Button>
              {loginType && (
                <>
                  <Modal.Open>
                    <Button variant="outline" className="w-full">
                      비밀번호 변경
                    </Button>
                  </Modal.Open>
                </>
              )}
            </div>
          )}
        </MainContainer>
        <Modal.Container>
          <div className="w-full p-10 flex flex-col gap-3">
            <p className="w-full text-center font-semibold text-lg pb-4">비밀번호 변경</p>
            <PasswordForm onSubmit={handleChangePassword} />
          </div>
        </Modal.Container>
      </Modal>
    </>
  );
};

export default ProfileUpdate;
