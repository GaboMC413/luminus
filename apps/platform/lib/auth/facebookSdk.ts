"use client";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (options: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: {
            accessToken: string;
            userID: string;
            expiresIn: number;
          };
          status: string;
        }) => void,
        options?: { scope: string }
      ) => void;
      getLoginStatus: (
        callback: (response: {
          authResponse?: {
            accessToken: string;
            userID: string;
          };
          status: string;
        }) => void
      ) => void;
    };
  }
}

export const FACEBOOK_APP_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "3684324738381969";

let sdkLoadingPromise: Promise<void> | null = null;

export function loadFacebookSDK(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.FB) {
    return Promise.resolve();
  }

  if (sdkLoadingPromise) {
    return sdkLoadingPromise;
  }

  sdkLoadingPromise = new Promise((resolve) => {
    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: "v20.0",
        });
      }
      resolve();
    };

    const id = "facebook-jssdk";
    if (document.getElementById(id)) {
      resolve();
      return;
    }

    const js = document.createElement("script");
    js.id = id;
    js.src = "https://connect.facebook.net/es_LA/sdk.js";
    js.async = true;
    js.defer = true;
    js.onload = () => {
      if (window.FB && window.fbAsyncInit) {
        window.fbAsyncInit();
      }
    };
    document.body.appendChild(js);
  });

  return sdkLoadingPromise;
}

export async function loginWithFacebook(): Promise<{ accessToken: string; userID: string }> {
  await loadFacebookSDK();

  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error("No se pudo cargar el SDK de Facebook."));
      return;
    }

    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          resolve({
            accessToken: response.authResponse.accessToken,
            userID: response.authResponse.userID,
          });
        } else {
          reject(new Error("El inicio de sesión con Facebook fue cancelado."));
        }
      },
      { scope: "public_profile,email" }
    );
  });
}
