// src/app/api/detect/route.js
import axios from "axios";

export async function POST(request) {
  console.log("here");
  try {
    const { image } = await request.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
      });
    }

    const response = await axios({
      method: "POST",
      url: "https://detect.roboflow.com/fresh-and-rottten-vegetable/10",
      params: {
        api_key: process.env.ROB_OFLOW_API_KEY || "unauthorized",
      },
      data: image,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    console.error("Error during detection:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
