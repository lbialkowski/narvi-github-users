import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  generateRegistrationOptions,
  PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import { storage } from "../storage";

const rpName = "Narvi";
const rpID = "narvi-github-users.vercel.app"; // As per user snippet. In local dev this might need to be 'localhost' but following snippet.

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return new NextResponse("Email required", { status: 400 });
  }

  const existingUser = await storage.findUserByEmail(email);

  // Use existing or generate new ID for user
  const userId = existingUser !== null ? existingUser.id : randomUUID();

  // Retrieve existing credentials
  const existingCredentials = await storage.findCredentialsByUserId(userId);

  console.log("existingCredentials", existingCredentials);

  const registrationOptions: PublicKeyCredentialCreationOptionsJSON =
    await generateRegistrationOptions({
      rpName,
      rpID,
      userName: email,
      userID: isoUint8Array.fromUTF8String(userId),
      excludeCredentials: existingCredentials.map((credential) => ({
        id: credential.credId,
        transports: credential.transports,
      })),
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred",
      },
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
    regOptions: registrationOptions,
    userId: userId,
    email: email // keeping track
  });

  const response = NextResponse.json(registrationOptions);
  if (newSession) {
    response.cookies.set("sessionId", sessionId, { httpOnly: true, sameSite: "strict", path: "/" });
  }
  
  return response;
}

