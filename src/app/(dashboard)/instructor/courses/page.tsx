
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BookOpen, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Course {
    id: string;
    name: string;
    description: string | null;
    subject: string;
    _count: {
        enrollments: number;
    };
}

interface Student {
    id: string;
    name: string;
    email: string;
}

export default function InstructorCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Assign Student Modal
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            // 1. Fetch Instructor Courses
            const coursesRes = await fetch("/api/instructor/courses");
            const coursesData = await coursesRes.json();

            // 2. Fetch Students (using existing academy members API)
            // Note: We might need to filter active students only.
            // The endpoint /api/academy/members returns all students in the academy.
            // Instructors can assign ANY student in the academy to their course.
            const membersRes = await fetch("/api/academy/members");
            const membersData = await membersRes.json();

            if (coursesRes.ok) setCourses(coursesData.courses);
            if (membersRes.ok) {
                setStudents(membersData.members.filter((m: any) => m.role === "STUDENT" && m.status === "ACTIVE"));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleAssignStudent() {
        if (!selectedCourseId || !selectedStudentId) return;

        try {
            // API checks if user is instructor of the course
            const res = await fetch(`/api/academy/courses/${selectedCourseId}/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: selectedStudentId }),
            });

            if (res.ok) {
                alert("학생이 배정되었습니다.");
                setSelectedStudentId("");
                fetchData();
            } else {
                const data = await res.json();
                alert(data.error || "배정에 실패했습니다.");
            }
        } catch (error) {
            alert("오류가 발생했습니다.");
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">내 강좌 관리</h1>
                <p className="text-muted-foreground">담당 과목에 학생을 배정하세요.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <Card key={course.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {course.subject}
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{course.name}</div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {course.description || "설명 없음"}
                            </p>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-sm">
                                    <span className="font-semibold w-16">학생:</span>
                                    <span>{course._count.enrollments}명</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-end">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedCourseId(course.id)}>
                                            <UserPlus className="mr-2 h-4 w-4" /> 학생 배정
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>학생 배정하기</DialogTitle>
                                            <DialogDescription>{course.name}에 학생을 추가합니다.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>학생 선택</Label>
                                                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="학생 선택" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {students.map((student) => (
                                                            <SelectItem key={student.id} value={student.id}>{student.name} ({student.email})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleAssignStudent}>배정하기</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {courses.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        아직 담당 과목이 없습니다. 원장님께 문의하세요.
                    </div>
                )}
            </div>
        </div>
    );
}
