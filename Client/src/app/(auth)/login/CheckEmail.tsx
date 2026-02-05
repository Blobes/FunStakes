"use client";

import { useLogin } from "@/app/(auth)/login/hook";
import { Stack, Typography } from "@mui/material";
import { useGlobalContext } from "@/app/GlobalContext";
import { AppButton } from "@/components/Buttons";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { ModalRef } from "@/components/Modal";
import { validateEmail } from "@/helpers/inputValidation";
import { useEffect, useState } from "react";
import { TextInput } from "@/components/InputFields";
import { GenericObject } from "@/types";
import { delay } from "@/helpers/global";
import { InlineMsg } from "@/components/InlineMsg";
import { ProgressIcon } from "@/components/ProgressIcon";
import { Mail } from "lucide-react";

interface CheckProps {
  modalRef?: React.RefObject<ModalRef>;
  step?: string;
  setStep?: (step: string) => void;
  existingEmail?: string;
  setEmailProp?: (email: string) => void;
  style?: {
    headline?: GenericObject<string>;
    tagline?: GenericObject<string>;
  };
}

export const CheckEmail: React.FC<CheckProps> = ({
  step,
  setStep,
  existingEmail,
  setEmailProp,
  style = {},
}) => {
  const { checkEmail } = useLogin();
  const { isAuthLoading, setAuthLoading, inlineMsg } = useGlobalContext();
  const [validity, setValidity] = useState<"valid" | "invalid">();
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState(existingEmail ?? "");
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (existingEmail && existingEmail !== "") {
      const validation = validateEmail(existingEmail);
      if (validation.status === "valid") {
        setValidity("valid");
        setMsg("");
      }
    }
  }, [step]);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setEmail(e.target.value);
    const validation = validateEmail(e.target.value);
    if (validation.status === "valid") {
      setValidity("valid");
      setMsg("");
    } else {
      setValidity("invalid");
      setMsg(validation.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setAuthLoading(true);
    await delay();
    const res = await checkEmail(email);
    if (res) {
      if (res.emailNotTaken === false) {
        setEmailProp?.(email);
        setStep?.("login");
      } else {
        router.replace(`/auth/signup?email=${email}`);
      }
    }

    setAuthLoading(false);
  };

  return (
    <>
      <Stack>
        <Typography
          component="h3"
          variant="h5"
          sx={{ textAlign: "center", ...style.headline }}>
          Blobes Socials, A Place For Nigerians
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
          Enter your email address to continue.
        </Typography>
      </Stack>

      {inlineMsg && <InlineMsg msg={inlineMsg} type="ERROR" />}

      <Stack
        sx={{ gap: theme.gap(18) }}
        component="form"
        onSubmit={handleSubmit}>
        <TextInput
          defaultValue={existingEmail}
          label="Email"
          placeholder="Enter your email address"
          onChange={handleChange}
          helperText={msg}
          error={email !== "" && validity === "invalid"}
          affix={
            <Mail
              size={19}
              style={{ stroke: theme.palette.gray[200] as string }}
            />
          }
          affixPosition="end"
        />
        <AppButton
          variant="contained"
          submit
          style={{
            fontSize: "16px",
            padding: theme.boxSpacing(5.5, 9),
            width: "100%",
          }}
          options={{
            disabled: validity === "invalid" || email === "" || isAuthLoading,
          }}>
          {isAuthLoading ? <ProgressIcon otherProps={{ size: 25 }} /> : "Continue"}
        </AppButton>
      </Stack>
    </>
  );
};
