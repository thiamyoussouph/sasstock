import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/stock-movements/company/[companyId]
export async function GET(req: Request, props: { params: Promise<{ companyId: string }> }) {
    const params = await props.params;
    const movements = await prisma.stockMovement.findMany({
        where: { companyId: params.companyId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(movements);
}