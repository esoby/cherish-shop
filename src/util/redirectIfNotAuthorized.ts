import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { User } from "@/interfaces/User";

export const redirectIfNotAuthorized = (user: User | null) => {
  // url의 uid와 현재 user id를 비교하여 접근 제어
  const { uid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.userId !== uid) navigate("/");
  }, []);
};
