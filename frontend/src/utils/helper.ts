import Cookies from "js-cookie";
export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  console.log(value);
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
  return undefined;
}
export const setCookie = (refresh: string, access: string) => {
  const currentDomain = window.location.hostname;
  const isLocalhost =
    currentDomain === "localhost" || currentDomain === "127.0.0.1";

  const commonOptions = {
    path: "/",
    secure: true,
    sameSite: isLocalhost ? ("lax" as const) : ("none" as const),
  };

  Cookies.set("_refresh_token", refresh, {
    ...commonOptions,
    expires: 7,
  });

  Cookies.set("_access_token", access, {
    ...commonOptions,
    expires: 1,
  });
};
