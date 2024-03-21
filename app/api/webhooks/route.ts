// This code was copied from Clerk

/* eslint-disable camelcase */
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser, deleteUser, updateUser } from "@/lib/actions/user.action";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.NEXT_CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers.
  // These are needed to ensure that the request is coming from Clerk.
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the type oo the event:
  const eventType = evt.type;

  console.log(`Webhook with type of ${eventType}`);
  console.log("Webhook body:", body);

  // Here we want to do something with the events.

  if (eventType === "user.created") {
    // Get the user data from the event
    const { id, email_addresses, image_url, username, first_name, last_name } =
      evt.data;

    console.log("[Route] user.created incoming data", evt.data);

    // Call a server action to create a user in the database:
    const mongoUser = await createUser({
      clerkId: id,
      name: `${first_name}${last_name ? ` ${last_name}` : ""}`,
      username: username!, // We know that username is not null because we are creating a user with Clerk
      email: email_addresses[0].email_address,
      picture: image_url,
    });

    // We return a Next response with the user data:
    return NextResponse.json({
      message: "User successfully created",
      user: mongoUser,
    });
  }

  if (eventType === "user.updated") {
    // Get the user data from the event
    const { id, email_addresses, image_url, username, first_name, last_name } =
      evt.data;

    // Call a server action to create a user in the database:
    const mongoUser = await updateUser({
      clerkId: id,
      updateData: {
        name: `${first_name}${last_name ? ` ${last_name}` : ""}`,
        username: username!, // We know that username is not null because we are creating a user with Clerk
        email: email_addresses[0].email_address,
        picture: image_url,
      },
      path: `/profile/${id}`, // We have to let Next which page has to be regenerated after the user is updated
    });

    // We return a Next response with the user data:
    return NextResponse.json({
      message: "User successfully updated",
      user: mongoUser,
    });
  }

  if (eventType === "user.deleted") {
    // Get the user id from the event
    const { id } = evt.data;

    // Call a server action to delete a user in the database:
    const deletedUser = await deleteUser({
      clerkId: id!,
    });

    // We return a Next response with the user data:
    return NextResponse.json({
      message: "User successfully deleted",
      user: deletedUser,
    });
  }

  return NextResponse.json({ message: "OK" });
}
