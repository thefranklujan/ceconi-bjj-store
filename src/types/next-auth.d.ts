import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    memberId?: string;
  }
  interface Session {
    user: {
      role?: string;
      memberId?: string;
    } & import("next-auth").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    memberId?: string;
  }
}
