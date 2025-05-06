export function setCookie(name: string, value: string, hours: number): void {
  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000); // แปลงชั่วโมงเป็น milliseconds
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${value}; ${expires}; path=/`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
}

//setCookie("myToken", "abc123", 168); // 168 ชั่วโมง = 7 วัน
//setCookie("shortToken", "xyz789", 3); // 3 ชั่วโมง

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; Path=/; Max-Age=0`;
}
