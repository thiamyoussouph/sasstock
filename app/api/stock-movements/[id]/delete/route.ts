import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    await prisma.stockMovement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}
