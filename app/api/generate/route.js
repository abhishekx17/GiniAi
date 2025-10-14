import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // --- Call Hugging Face Space ---
    const hfResponse = await fetch(
      "https://stabilityai-stable-diffusion.hf.space/run/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: [prompt] }),
      }
    );

    if (!hfResponse.ok) {
      const text = await hfResponse.text();
      throw new Error(`Hugging Face Space error: ${text}`);
    }

    const hfData = await hfResponse.json();

    // Hugging Face Spaces return the image in hfData.data[0] as base64
    const base64Image = hfData?.data?.[0]?.replace(
      /^data:image\/png;base64,/,
      ""
    );
    if (!base64Image) {
      throw new Error("No image returned from Hugging Face Space");
    }

    // --- Upload to Cloudinary ---
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64Image}`,
      {
        folder: "hf_images",
        public_id: `hf_${Date.now()}`,
        overwrite: true,
      }
    );

    return NextResponse.json({
      success: true,
      prompt,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (err) {
    console.error("Error generating or uploading image:", err);
    return NextResponse.json(
      { error: err.message || "Image generation failed" },
      { status: 500 }
    );
  }
}
