import { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { trackPlatformRegistration } from "@/lib/meta-pixel";

interface VerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function VerificationModal({ isOpen, email, onClose, onSuccess }: VerificationModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Ref for the input field to auto-focus when modal opens
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCode("");
      setMessage({ text: "", type: "" });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleVerify = async () => {
    if (!code || code.length < 6) {
      setMessage({ text: "Ingresa el código de 6 dígitos.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.message ?? "Código incorrecto.", type: "error" });
        return;
      }

      trackPlatformRegistration("verified");
      onSuccess();
    } catch (err) {
      setMessage({ text: "Error de conexión. Intenta nuevamente.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.message ?? "No pudimos reenviar el código.", type: "error" });
      } else {
        setMessage({ text: "¡Código reenviado! Revisa tu bandeja de entrada o spam.", type: "success" });
      }
    } catch (err) {
      setMessage({ text: "Error al solicitar un nuevo código.", type: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verifica tu correo"
      footer={
        <div className="flex flex-col gap-3 w-full">
          <Button
            variant="primary"
            onClick={handleVerify}
            disabled={loading || code.length < 6}
            className="w-full"
          >
            {loading ? "Verificando..." : "Verificar correo"}
          </Button>
          <div className="flex justify-center items-center w-full mt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-body-small text-slate-500 hover:text-slate-900 underline font-medium cursor-pointer bg-transparent border-none outline-none disabled:opacity-50"
            >
              {resending ? "Reenviando..." : "¿No recibiste el código? Reenviar"}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 font-sans">
        <p className="text-slate-600 text-[15px] leading-relaxed">
          Hemos enviado un código de 6 dígitos a <span className="font-semibold text-slate-900">{email}</span>. Ingresa el código a continuación para verificar tu cuenta.
        </p>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(val);
              if (message.type === 'error') setMessage({ text: "", type: "" });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && code.length >= 6) {
                e.preventDefault();
                handleVerify();
              }
            }}
            className="w-full px-4 py-3 text-2xl tracking-[0.5em] text-center font-mono font-bold bg-white border border-zinc-200/80 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
          />
          
          {message.text && (
            <p className={`text-center mt-2 text-sm font-bold ${message.type === 'error' ? 'text-red-500' : 'text-green-600'} tracking-tight`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
