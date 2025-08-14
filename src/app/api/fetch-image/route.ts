import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name)
    return NextResponse.json({ error: "Name required" }, { status: 400 });

  const unsplashUrl = `https://source.unsplash.com/128x128/?face,portrait,person,${encodeURIComponent(
    name
  )}`;
  let image = unsplashUrl;
  try {
    const res = await fetch(unsplashUrl, { method: "HEAD" });
    if (!res.ok || res.url.includes("source-404")) {
      throw new Error("No Unsplash image");
    }
    image = res.url;
  } catch {
    const backgrounds = [
      "FFB300",
      "803E75",
      "FF6800",
      "A6BDD7",
      "C10020",
      "CEA262",
      "817066",
      "007D34",
      "F6768E",
      "00538A",
      "FF7A5C",
      "53377A",
      "FF8E00",
      "B32851",
      "F4C800",
      "7F180D",
      "93AA00",
      "593315",
      "F13A13",
      "232C16",
    ];
    const color = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const fonts = [
      "Roboto",
      "Open Sans",
      "Lato",
      "Montserrat",
      "Oswald",
      "Raleway",
    ];
    const font = fonts[Math.floor(Math.random() * fonts.length)];
    const rounded = Math.random() > 0.5 ? "true" : "false";
    image = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=${color}&color=fff&size=128&font-family=${encodeURIComponent(
      font
    )}&rounded=${rounded}`;
  }
  return NextResponse.json({ image });
}
