import { fetcher } from "@/helpers/fetcher";
import { serverApi } from "@/helpers/routes";
import { IUser, ISingleResponse } from "@/types";

interface LoginCredentials {
  email: string;
  password: string;
}
interface LoginResponse extends ISingleResponse<IUser> {
  fixedMsg?: string;
}
interface CheckEmailResponse {
  emailNotTaken: boolean;
  message: string;
}

export const useLoginService = () => {
  const checkEmail = async (email: string): Promise<CheckEmailResponse> => {
    return await fetcher<CheckEmailResponse>(serverApi.checkEmail, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const login = async (
    credentials: LoginCredentials,
  ): Promise<LoginResponse> => {
    return await fetcher<LoginResponse>(serverApi.login, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  };

  return { checkEmail, login };
};
