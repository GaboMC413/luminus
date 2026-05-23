import React from "react";

export const AuthDivider: React.FC = () => {
  return (
    <div className="relative w-full flex items-center py-4">
      <div className="flex-grow border-t border-wellness-sand-200"></div>
      <span className="flex-shrink mx-4 text-[10px] uppercase font-bold tracking-widest text-wellness-sage-400">
        or continue with
      </span>
      <div className="flex-grow border-t border-wellness-sand-200"></div>
    </div>
  );
};
export default AuthDivider;
