import { NextResponse } from "next/server";

//
export const POST = async (request: Request) => {
  // First we get the question from the request body
  const { question } = await request.json();
  //   console.log("[Route  handler - POST] question:", question);

  try {
    // Then we make a call to the OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that provides quality information.",
          },
          {
            role: "user",
            content: `Tell me ${question}`,
          },
        ],
      }),
    });

    // Now that we have the response we extract the data from it:
    const responseData = await response.json();
    console.log("[Route  handler - POST] responseData:", responseData);

    const reply = responseData.choices[0].message.content;

    // And we return the reply.
    return NextResponse.json({ reply });
  } catch (error: unknown) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
