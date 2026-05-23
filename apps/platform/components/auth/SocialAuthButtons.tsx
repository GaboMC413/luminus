import React from "react";

interface SocialAuthButtonsProps {
  onGoogleClick?: () => void;
  onAppleClick?: () => void;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGoogleClick,
  onAppleClick
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <button
        type="button"
        onClick={onGoogleClick}
        className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-white hover:bg-wellness-sand-50 border border-wellness-sand-200 text-wellness-sage-800 text-sm font-medium rounded-2xl transition-premium active:scale-[0.98]"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 0, 0)">
            <path
              d="M21.35,11.1H12v2.7h5.38C17,15.17,15.17,16.5,12,16.5c-3,0-5.5-2.27-5.5-5.5s2.5-5.5,5.5-5.5c1.67,0,3,0.67,4,1.56l2-2C16.24,3.2,14.29,2.5,12,2.5c-5.24,0-9.5,4.26-9.5,9.5s4.26,9.5,9.5,9.5c5,0,9.5-3.6,9.5-9.5a8.77,8.77,0,0,0-.15-1.9Z"
              fill="#4285F4"
            />
            <path
              d="M12,21.5c2.44,0,4.68-.81,6.38-2.23l-3.08-2.39a5.9,5.9,0,0,1-3.3.92,5.91,5.91,0,0,1-5.58-4.09H3.13v2.54A9.5,9.5,0,0,0,12,21.5Z"
              fill="#34A853"
            />
            <path
              d="M6.42,13.71a5.86,5.86,0,0,1,0-3.42V7.75H3.13a9.5,9.5,0,0,0,0,8.5Z"
              fill="#FBBC05"
            />
            <path
              d="M12,6.5a5.79,5.79,0,0,1,4.09,1.59l2.05-2.05A8.77,8.77,0,0,0,12,2.5,9.5,9.5,0,0,0,3.13,7.75l3.29,2.54A5.91,5.91,0,0,1,12,6.5Z"
              fill="#EA4335"
            />
          </g>
        </svg>
        <span className="text-xs tracking-wider uppercase font-semibold">Google</span>
      </button>

      <button
        type="button"
        onClick={onAppleClick}
        className="flex items-center justify-center gap-2.5 px-4 py-3.5 bg-white hover:bg-wellness-sand-50 border border-wellness-sand-200 text-wellness-sage-800 text-sm font-medium rounded-2xl transition-premium active:scale-[0.98]"
      >
        <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.71,19.5C17.88,20.74,17,21.95,15.66,22c-1.28,0-1.7-.78-3.17-.78s-1.93.75-3.17.78C8,22,7,20.65,6.17,19.41C4.48,17,3.18,12.49,4.92,9.48a5.27,5.27,0,0,1,4.45-2.7c1.33,0,2.59.92,3.4,1C13.58,7.66,15,.6,16.5,7C17.78,7.1,19.45,7.78,20.45,8.8A5,5,0,0,1,21,12.5C18.9,13.62,18.41,16.48,20.25,18.3A17.13,17.13,0,0,1,18.71,19.5M16,3.5A4.47,4.47,0,0,0,17.06.33a4.43,4.43,0,0,0-3.32,1.7,4,4,0,0,0-1.12,3C14,5,15.11,4.24,16,3.5Z" />
        </svg>
        <span className="text-xs tracking-wider uppercase font-semibold">Apple</span>
      </button>
    </div>
  );
};
export default SocialAuthButtons;
