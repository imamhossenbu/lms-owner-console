import React from "react";

interface AuthCardContainerProps {
  children: React.ReactNode;
}

export function AuthCardContainer({ children }: AuthCardContainerProps) {
  return (
    <div className="min-h-screen w-full bg-gray-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-brand-orange selection:text-white font-sans">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-340 xl:max-w-360 min-h-0 lg:min-h-195 xl:min-h-205 bg-white rounded-2xl sm:rounded-3xl lg:rounded-4xl overflow-hidden shadow-xl lg:shadow-2xl flex flex-col lg:flex-row border border-dash relative">
        {children}
      </div>
    </div>
  );
}
