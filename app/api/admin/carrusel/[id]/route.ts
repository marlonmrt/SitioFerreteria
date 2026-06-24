import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getCarouselSlideById,
  updateCarouselSlide,
  deleteCarouselSlide
} from "@/lib/db/queries/catalog";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { type?: string }).type !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getCarouselSlideById(id);
    if (!existing) {
      return NextResponse.json({ error: "Diapositiva no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const slide = await updateCarouselSlide(id, body);
    return NextResponse.json(slide);
  } catch (error) {
    console.error("Error al actualizar diapositiva:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { type?: string }).type !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getCarouselSlideById(id);
    if (!existing) {
      return NextResponse.json({ error: "Diapositiva no encontrada" }, { status: 404 });
    }

    await deleteCarouselSlide(id);
    return NextResponse.json({ message: "Diapositiva eliminada" });
  } catch (error) {
    console.error("Error al eliminar diapositiva:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}