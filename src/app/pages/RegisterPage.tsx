import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/app/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authApi } from "@/api/auth";
import { institutionsApi } from "@/api/institutions";

const schema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(120),
    nickname: z.string().trim().min(2, "Nickname is required").max(64),
    matricNumber: z.string().trim().min(3, "Matric number is required").max(64),
    password: z.string().min(8, "Use at least 8 characters").max(128),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    facultyId: z.string().optional(),
    departmentId: z.string().optional(),
    levelId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [checkedNickname, setCheckedNickname] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      nickname: "",
      matricNumber: "",
      password: "",
      confirmPassword: "",
      facultyId: "",
      departmentId: "",
      levelId: "",
    },
  });
  const facultyId = form.watch("facultyId");
  const departmentId = form.watch("departmentId");
  const levelId = form.watch("levelId");
  const nickname = form.watch("nickname");
  const faculties = useQuery({
    queryKey: ["institutions", "faculties"],
    queryFn: institutionsApi.faculties.list,
  });
  const departments = useQuery({
    queryKey: ["institutions", "departments", facultyId],
    queryFn: () => institutionsApi.departments.list(facultyId),
    enabled: !!facultyId,
  });
  const levels = useQuery({
    queryKey: ["institutions", "levels"],
    queryFn: institutionsApi.levels.list,
  });

  const mutation = useMutation({
    mutationFn: authApi.studentRegister,
    onSuccess: () => {
      toast.success("Registration submitted. Please sign in.");
      navigate("/login/student", { replace: true });
    },
  });
  const nicknameCheck = useMutation({ mutationFn: authApi.checkNickname });
  const nicknameAvailable =
    checkedNickname === nickname.trim()
      ? (nicknameCheck.data?.available ??
        nicknameCheck.data?.isAvailable ??
        nicknameCheck.data?.data?.available ??
        nicknameCheck.data?.data?.isAvailable)
      : undefined;

  return (
    <Card className="glass border-white/40 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="font-display text-2xl">Create your account</CardTitle>
        <CardDescription>Register as an ADUN student to vote</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((v) => {
            if (nicknameAvailable === false) {
              toast.error("Choose an available nickname");
              return;
            }
            mutation.mutate({
              name: v.name,
              nickname: v.nickname,
              matricNumber: v.matricNumber,
              password: v.password,
              facultyId: v.facultyId || undefined,
              departmentId: v.departmentId || undefined,
              levelId: v.levelId || undefined,
            });
          })}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="John Doe" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                placeholder="johndoe"
                {...form.register("nickname", {
                  onBlur: (event) => {
                    const value = event.target.value.trim();
                    if (value.length >= 2) {
                      setCheckedNickname(value);
                      nicknameCheck.mutate(value);
                    }
                  },
                  onChange: () => {
                    setCheckedNickname("");
                    nicknameCheck.reset();
                  },
                })}
              />
              {nicknameCheck.isPending ? (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
                </p>
              ) : nicknameAvailable === true ? (
                <p className="text-xs text-green-700">Nickname is available.</p>
              ) : nicknameAvailable === false ? (
                <p className="text-xs text-destructive">Nickname is already taken.</p>
              ) : form.formState.errors.nickname ? (
                <p className="text-xs text-destructive">{form.formState.errors.nickname.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="matric">Matric Number</Label>
            <Input
              id="matric"
              placeholder="ADUN/FS/SEN/22/036"
              {...form.register("matricNumber")}
            />
            {form.formState.errors.matricNumber && (
              <p className="text-xs text-destructive">
                {form.formState.errors.matricNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select
                value={facultyId || undefined}
                onValueChange={(value) => {
                  form.setValue("facultyId", value, { shouldDirty: true, shouldValidate: true });
                  form.setValue("departmentId", "", { shouldDirty: true });
                }}
                disabled={faculties.isLoading}
              >
                <SelectTrigger id="faculty" className="h-10">
                  <SelectValue
                    placeholder={faculties.isLoading ? "Loading faculties..." : "Select faculty"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(faculties.data ?? []).length === 0 && !faculties.isLoading ? (
                    <SelectItem value="__no_faculties" disabled>
                      No faculties available
                    </SelectItem>
                  ) : (
                    (faculties.data ?? []).map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={departmentId || undefined}
                onValueChange={(value) =>
                  form.setValue("departmentId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                disabled={!facultyId || departments.isLoading}
              >
                <SelectTrigger id="department" className="h-10">
                  <SelectValue
                    placeholder={
                      !facultyId
                        ? "Select a faculty first"
                        : departments.isLoading
                          ? "Loading departments..."
                          : "Select department"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(departments.data ?? []).length === 0 && !departments.isLoading ? (
                    <SelectItem value="__no_departments" disabled>
                      No departments available
                    </SelectItem>
                  ) : (
                    (departments.data ?? []).map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select
              value={levelId || undefined}
              onValueChange={(value) =>
                form.setValue("levelId", value, { shouldDirty: true, shouldValidate: true })
              }
              disabled={levels.isLoading}
            >
              <SelectTrigger id="level" className="h-10">
                <SelectValue
                  placeholder={levels.isLoading ? "Loading levels..." : "Select level"}
                />
              </SelectTrigger>
              <SelectContent>
                {(levels.data ?? []).length === 0 && !levels.isLoading ? (
                  <SelectItem value="__no_levels" disabled>
                    No levels available
                  </SelectItem>
                ) : (
                  (levels.data ?? []).map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login/student" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
