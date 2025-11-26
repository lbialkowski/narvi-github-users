import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyAuthenticationResponse,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import { storage } from "../storage";

const rpID = "narvi-github-users.vercel.app";
const androidOrigin = "android:apk-key-hash:-sYXRdwJA3hvue3mKpYrOZ9zSPC7b4mbgzJmdZEDO5w";
const defaultOrigin = `https://${rpID}`;

export async function POST(request: Request) {
  const body = await request.json(); // This is request.body

  if (!body) {
    return new NextResponse(null, { status: 400 });
  }

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;
  
  if (!sessionId) {
     return new NextResponse(null, { status: 400 });
  }

  const sessionData = storage.getSession(sessionId);

  if (!sessionData.authOptions) {
    return new NextResponse(null, { status: 400 });
  }

  // User code uses request.body.userHandle. 
  // We'll use that, assuming the client sends it at the top level.
  const userHandle = body.userHandle || body.response?.userHandle;

  if (!userHandle) {
      // If we can't find userHandle, we might fail. 
      // But maybe logic allows finding by credential ID?
      // The original code strictly uses findOneByUserId(request.body.userHandle)
      console.error("No userHandle found in body");
      return new NextResponse(null, { status: 400 });
  }

  // findOneByUserId implementation (finding *a* credential for the user)
  // Note: In a real app, we should look up by credential ID (body.id)
  const credentials = await storage.findCredentialsByUserId(userHandle);
  const fidoData = credentials[0]; // Mocking findOneByUserId

  if (!fidoData) {
    return new NextResponse(null, { status: 400 });
  }

  const origin =
    body.platform == "android" ? androidOrigin : defaultOrigin;

  try {
    const { verified, authenticationInfo } =
      await verifyAuthenticationResponse({
        response: body as AuthenticationResponseJSON,
        expectedChallenge: sessionData.authOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: fidoData.credId,
          publicKey: isoUint8Array.fromHex(fidoData.pubKey),
          counter: fidoData.counter,
          transports: fidoData.transports,
        },
      });

    const counter: number = authenticationInfo.newCounter;
    await storage.updateCredentialCounter(fidoData.id, counter);

    if (verified) {
      return new NextResponse("OK", { status: 200 });
    }
    return new NextResponse(null, { status: 400 });
  } catch (error) {
    console.error(error);
    return new NextResponse(null, { status: 400 });
  }
}

