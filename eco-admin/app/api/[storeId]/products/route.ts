import { validationFieldsApiStatus400 } from "@/lib/api-utils";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      price,
      categoryId,
      colorId,
      sizeId,
      images,
      isFeatured,
      isArchived,
    } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    validationFieldsApiStatus400(name, "Name");
    validationFieldsApiStatus400(price, "Price");
    validationFieldsApiStatus400(categoryId, "Category id");
    validationFieldsApiStatus400(colorId, "Color id");
    validationFieldsApiStatus400(sizeId, "Size id");

    if (!images || !images.length)
      return new NextResponse("Images is required", { status: 400 });

    if (!params.storeId)
      return new NextResponse("Store id is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 403 });

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        categoryId,
        isFeatured,
        isArchived,
        colorId,
        sizeId,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.log("[PRODUCTS_POST]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const colorId = searchParams.get("colorId") || undefined;
    const sizeId = searchParams.get("sizeId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!params.storeId)
      return new NextResponse("Store id is required", { status: 400 });

    const product = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.log("[PRODUCTS_GET]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
