import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  generateAuthenticationOptions,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { storage } from "./storage";

const rpID = "narvi-github-users.vercel.app";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  const user = await storage.findUserByEmail(email);
  
  if (!user) {
    // It's good practice to return a 400 or generic error, code implies silent return or maybe undefined handling
    // The original code: 
    // const user = await this.userService.findOneByEmail(email);
    // const fido = await this.fidoService.findByUserId(user?.id ?? "");
    // if (fido === null) return;
    // If user is null, user?.id is undefined. findByUserId("") returns likely empty array or null.
    return new NextResponse(null, { status: 200 }); // Or 404? Original code returns void which sends 200 OK with empty body usually in NestJS/Express unless configured otherwise.
  }

  const fido = await storage.findCredentialsByUserId(user.id);

  if (!fido || fido.length === 0) {
    return new NextResponse(null, { status: 200 });
  }

  console.log("fido", fido[0].transports);

  const authOptions: PublicKeyCredentialRequestOptionsJSON =
    await generateAuthenticationOptions({
      rpID,
      // Require users to use a previously-registered authenticator
      allowCredentials: fido
        .filter(
          (passkey) =>
            passkey.credId && isoBase64URL.isBase64URL(passkey.credId)
        )
        .map((passkey) => ({
          id: isoBase64URL.trimPadding(passkey.credId),
        })),
    });

  // Handle session
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("sessionId")?.value;
  let newSession = false;
  
  if (!sessionId) {
    sessionId = randomUUID();
    newSession = true;
  }

  storage.updateSession(sessionId, {
    authOptions: authOptions,
    // No userId stored here in original code, but maybe needed later?
    // Original code: request.session.authOptions = authOptions;
  });

  console.log(authOptions);

  const response = NextResponse.json(authOptions);
  if (newSession) {
    response.cookies.set("sessionId", sessionId, { httpOnly: true, sameSite: "strict", path: "/" });
  }

  return response;
}

