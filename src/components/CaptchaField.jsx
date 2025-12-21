"use client";
import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const SITEKEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;

const CaptchaField = forwardRef(function CaptchaField(_, ref) {
  const captchaRef = useRef(null);
  const [token, setToken] = useState(null);

  useImperativeHandle(ref, () => ({
    getToken: () => token,
    reset: () => {
      try {
        captchaRef.current?.resetCaptcha();
        setToken(null);
      } catch {}
    },
  }));

  if (!SITEKEY) {
    return (
      <div className="text-yellow-400 text-sm">
        hCaptcha sitekey em falta (NEXT_PUBLIC_HCAPTCHA_SITEKEY)
      </div>
    );
  }

  return (
    <div className="mt-3">
      <HCaptcha
        ref={captchaRef}
        sitekey={SITEKEY}
        onVerify={(tok) => setToken(tok)}
        onExpire={() => setToken(null)}
        onError={() => setToken(null)}
      />
    </div>
  );
});

export default CaptchaField;
