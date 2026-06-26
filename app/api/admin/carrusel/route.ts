import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllCarouselSlides, createCarouselSlide } from "@/lib/db/queries/catalog";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { type?: string }).type !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const slides = await getAllCarouselSlides();
    return NextResponse.json(slides);
  } catch (error) {
    console.error("Error al obtener diapositivas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { type?: string }).type !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const slide = await createCarouselSlide({
      title: body.title,
      subtitle: body.subtitle,
      ctaLabel: body.ctaLabel,
      ctaHref: body.ctaHref,
      gradientFrom: body.gradientFrom,
      gradientVia: body.gradientVia,
      gradientTo: body.gradientTo,
      backgroundImage: body.backgroundImage,
      textColor: body.textColor,
      sortOrder: body.sortOrder
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error("Error al crear diapositiva:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}