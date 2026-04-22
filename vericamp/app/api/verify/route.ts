import { NextResponse } from "next/server";

export async function POST(request: Request) {
    // Simulate AI Processing Delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real hackathon project, we would send the image to OpenAI Vision API here.
    // For the MVP demo, we mock a successful verification of a "Medical Certificate".

    const demoResult = {
        verified: true,
        confidence: 0.98,
        documentType: "Medical Certificate",
        issuer: "Campus Health Center",
        timestamp: new Date().toISOString(),
        // We generate a mock hash that would be stored on-chain
        hash: "b543ac17457812e8d712865217482"
    };

    return NextResponse.json(demoResult);
}
