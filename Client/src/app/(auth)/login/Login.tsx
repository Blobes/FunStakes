"use client";

import { useLogin } from "@/app/(auth)/login/hook";
import { IconButton, Stack, Typography } from "@mui/material";
import { useGlobalContext } from "@/app/GlobalContext";
import { AppButton } from "@/components/Buttons";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { delay } from "@/helpers/global";
import { useEffect, useState } from "react";
import { useController } from "@/hooks/global";
import { PasswordInput } from "@/components/InputFields";
import { InlineMsg } from "@/components/InlineMsg";
import { BasicTooltip } from "@/components/Tooltips";
import { GenericObject } from "@/types";
import { clientRoutes } from "@/helpers/routes";
import { ProgressIcon } from "@/components/ProgressIcon";
import { Pencil } from "lucide-react";

interface LoginProps {
  email: string;
  step?: string;
  setStep?: (step: string) => void;
  redirectTo?: string;
  style?: {
    headline?: GenericObject<string>;
    tagline?: GenericObject<string>;
  };
}

export const Login: React.FC<LoginProps> = ({
  email,
  step,
  setStep,
  style = {},
}) => {
  const {
    handleLogin,
    loginAttempts,
    MAX_ATTEMPTS,
    lockTimestamp,
    startLockCountdown,
  } = useLogin();
  const { inlineMsg, setInlineMsg, isAuthLoading, setAuthLoading, lastPage } =
    useGlobalContext();
  const { isOnWeb } = useController();
  const [msg, setMsg] = useState("");
  const [passwordValidity, setPasswordValidity] = useState<
    "valid" | "invalid"
  >();
  const [password, setPassword] = useState("");
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    startLockCountdown(Number(lockTimestamp));
    setInlineMsg(null);
  }, [step]);

  const onPasswordChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value.length >= 6) {
      setPassword(e.target.value);
      setPasswordValidity("valid");
      setMsg("");
    } else if (value.length === 0) {
      setPasswordValidity("invalid");
      setMsg("Password is required.");
    } else {
      setPasswordValidity(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthLoading(true);
    await delay();

    const res = await handleLogin({
      email: email,
      password: password,
    });
    if (res) {
      const { payload, status } = res;
      if (payload && status === "SUCCESS") {
        setStep?.("email");
        const isLastWeb = isOnWeb(lastPage.path);
        router.push(isLastWeb ? clientRoutes.home.path : lastPage.path);
      }
    }
    setAuthLoading(false);
  };

  return (
    <>
      <Stack>
        <Typography
          component="h4"
          variant="h5"
          sx={{ textAlign: "center", ...style.headline }}>
          Welcome back buzzer!
        </Typography>
        <Typography
          component="p"
          variant="body2"
          sx={{
            color: theme.palette.gray[200],
            paddingBottom: theme.boxSpacing(8),
            textAlign: "center",
            ...style.tagline,
          }}>
          Enter your password to login.
        </Typography>
      </Stack>

      {!isAuthLoading && inlineMsg && (
        <InlineMsg msg={inlineMsg} type="ERROR" />
      )}

      <Stack
        sx={{ gap: theme.gap(8) }}
        component="form"
        onSubmit={handleSubmit}>
        <Stack direction="row">
          <Typography
            component="p"
            variant="body2"
            sx={{
              textAlign: "left",
              padding: theme.boxSpacing(6, 8),
              borderRadius: theme.radius[3],
              color: theme.palette.primary.dark,
              border: `1px solid ${theme.fixedColors.mainTrans}`,
              backgroundColor: theme.fixedColors.mainTrans,
              width: "100%",
              fontWeight: "500",
              fontSize: "16px"
            }}>
            {email}
          </Typography>
          <BasicTooltip title={"Change email"}>
            <IconButton
              sx={{
                padding: theme.boxSpacing(3, 4),
                color: theme.palette.gray[200],
                border: `1px solid ${theme.palette.gray.trans[1]}`,
                borderRadius: theme.radius[3],
                width: "48px",
              }}
              onClick={() => {
                setStep?.("email");
              }}>
              <Pencil style={{ width: "20px", stroke: theme.palette.gray[200] }} />
            </IconButton>
          </BasicTooltip>
        </Stack>
        <PasswordInput
          label="Password"
          placeholder="Password"
          onChange={onPasswordChange}
          helperText={msg}
          error={password === "" && passwordValidity === "invalid"}
        />
        <AppButton
          variant="contained"
          {...(isAuthLoading && {
            iconLeft: <ProgressIcon otherProps={{ size: 25 }} />,
          })}
          submit
          style={{
            fontSize: "16px",
            padding: theme.boxSpacing(4, 8),
            width: "100%",
          }}
          options={{
            disabled:
              passwordValidity === "invalid" ||
              password === "" ||
              loginAttempts >= MAX_ATTEMPTS ||
              isAuthLoading,
          }}>
          {!isAuthLoading && "Login"}
        </AppButton>
      </Stack>
    </>
  );
};
