import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supportedLocales: ["en", "ta", "si", "zh", "es", "fr", "de", "nl", "pt", "ru", "it", "ja", "ko", "ar", "hi", "bn", "tr", "id", "vi", "th", "ms", "pl", "uk", "nb", "sv", "da", "kl", "fi", "el", "he", "fa", "ha", "yo", "ig", "zu", "am"],
  });
}
