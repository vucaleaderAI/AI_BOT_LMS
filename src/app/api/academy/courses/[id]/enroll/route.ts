
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.academyId) {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const { id: courseId } = await params;
        const body = await request.json();
        const { studentId } = body;

        // 1. 권한 확인: 원장이거나 해당 과목의 강사여야 함
        const course = await prisma.class.findUnique({
            where: { id: courseId },
            include: { instructor: true },
        });

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        if (course.academyId !== user.academyId) {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        const isOwner = user.role === "OWNER";
        const isInstructorOfCourse =
            user.role === "INSTRUCTOR" && course.instructorId === user.id;

        if (!isOwner && !isInstructorOfCourse) {
            return NextResponse.json({ error: "Permission Denied" }, { status: 403 });
        }

        // 2. 학생 확인 (같은 학원인지)
        const student = await prisma.user.findUnique({
            where: { id: studentId, academyId: user.academyId, role: "STUDENT" },
        });

        if (!student) {
            return NextResponse.json(
                { error: "Student not found or not in this academy" },
                { status: 404 }
            );
        }

        // 3. 등록
        const enrollment = await prisma.classEnrollment.create({
            data: {
                studentId,
                classId: courseId,
            },
        });

        return NextResponse.json({ enrollment });
    } catch (error) {
        if (error instanceof Error && 'code' in error && (error as { code: string }).code === "P2002") {
            return NextResponse.json(
                { error: "Student is already enrolled in this course" },
                { status: 400 }
            );
        }
        console.error("Error enrolling student:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
