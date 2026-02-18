
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, BookOpen, Users, UserPlus } from "lucide-react";


interface Course {
    id: string;
    name: string;
    description: string | null;
    subject: string;
    instructorId: string | null;
    instructor: {
        id: string;
        name: string;
        email: string;
    } | null;
    _count: {
        enrollments: number;
    };
}

interface Instructor {
    id: string;
    name: string;
    email: string;
}

interface Student {
    id: string;
    name: string;
    email: string;
}

export default function OwnerCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Create Course Form
    const [newName, setNewName] = useState("");
    const [newSubject, setNewSubject] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newInstructorId, setNewInstructorId] = useState("");

    // Assign Student Modal
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            // 1. Fetch Courses
            const coursesRes = await fetch("/api/academy/courses");
            const coursesData = await coursesRes.json();

            // 2. Fetch Members (to get Instructors and Students)
            const membersRes = await fetch("/api/academy/members");
            const membersData = await membersRes.json();

            if (coursesRes.ok) setCourses(coursesData.courses);
            if (membersRes.ok) {
                setInstructors(membersData.members.filter((m: any) => m.role === "INSTRUCTOR" && m.status === "ACTIVE"));
                setStudents(membersData.members.filter((m: any) => m.role === "STUDENT" && m.status === "ACTIVE"));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateCourse(e: React.FormEvent) {
        e.preventDefault();
        setIsCreating(true);

        try {
            const res = await fetch("/api/academy/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    subject: newSubject,
                    description: newDescription,
                    instructorId: newInstructorId || null,
                }),
            });

            if (res.ok) {
                alert("과정이 생성되었습니다.");
                setNewName("");
                setNewSubject("");
                setNewDescription("");
                setNewInstructorId("");
                fetchData(); // Refresh list
            } else {
                alert("과정 생성에 실패했습니다.");
            }
        } catch (error) {
            alert("오류가 발생했습니다.");
        } finally {
            setIsCreating(false);
        }
    }

    async function handleAssignStudent() {
        if (!selectedCourseId || !selectedStudentId) return;

        try {
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">과정 관리</h1>
                    <p className="text-muted-foreground">과정을 생성하고 강사와 학생을 배정하세요.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> 과정 생성
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>새 과정 만들기</DialogTitle>
                            <DialogDescription>과정 정보를 입력하세요.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">과정명</Label>
                                <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="예: 파이썬 기초반" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">과목</Label>
                                <Input id="subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} required placeholder="예: Python" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">설명 (선택)</Label>
                                <Textarea id="description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instructor">담당 강사 (선택)</Label>
                                <Select value={newInstructorId} onValueChange={setNewInstructorId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="강사 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">미배정</SelectItem>
                                        {instructors.map((inst) => (
                                            <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    생성하기
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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
                                    <span className="font-semibold w-16">강사:</span>
                                    <span>{course.instructor ? course.instructor.name : "미배정"}</span>
                                </div>
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
                        생성된 과정이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
