"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Users,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/authContext";
import { useAppointments } from "@/hooks/useAppointments";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Constants
const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
] as const;

// const RELATION_OPTIONS = [
//   { value: "spouse", label: "Spouse" },
//   { value: "child", label: "Child" },
//   { value: "parent", label: "Parent" },
//   { value: "sibling", label: "Sibling" },
//   { value: "other", label: "Other" },
// ];

const RELATION_OPTIONS = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "brother", label: "Brother" },
  { value: "sister", label: "Sister" },
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "other", label: "Other" },
];

const MAX_NOTES_LENGTH = 200;

// Define Zod schema
const formSchema = z
  .object({
    appointmentFor: z.enum(["self", "relative"]),
    patientName: z.string().min(1, "Patient name is required"),
    age: z
      .number()
      .min(0.08, "Minimum age is 1 month") // 1/12 ≈ 0.083
      .max(120, "Maximum age is 120 years")
      .refine((val) => {
        // Allow either integer years (1+) or decimal for months (0.083-0.999)
        return val >= 1 ? Number.isInteger(val) : true;
      }, "For ages 1+, please enter whole years only"),
    gender: z.enum(["male", "female", "other"]),
    relation: z.string().optional(),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(
        /^03\d{9}$/,
        "Valid Pakistani phone number (03XXXXXXXXX) is required"
      ),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    notes: z
      .string()
      .max(
        MAX_NOTES_LENGTH,
        `Notes cannot exceed ${MAX_NOTES_LENGTH} characters`
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.appointmentFor === "relative" && !data.relation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Relation is required",
        path: ["relation"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export default function BookAppointmentPage() {
  // State for showing months selector
  const [showMonths, setShowMonths] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { getAvailableDates, createAppointment } = useAppointments();

  // const availableDates = useMemo(() => getAvailableDates(), [getAvailableDates])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      appointmentFor: "self",
      patientName: "",
      age: 0,
      gender: undefined,
      relation: "",
      phone: "",
      date: "",
      time: "",
      notes: "",
    },
  });

  const { watch, reset, setError } = form;
  const appointmentFor = watch("appointmentFor");
  const notes = watch("notes");
  const loading = form.formState.isSubmitting;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    reset({
      appointmentFor: "self",
      patientName: user.email?.split("@")[0] || "",
      age: 0,
      gender: undefined,
      relation: "",
      phone: "",
      date: "",
      time: "",
      notes: "",
    });
  }, [user, reset]);

  // const onSubmit = async (values: FormValues) => {
  //   if (!user) {
  //     form.setError("root", { message: "User not authenticated" })
  //     return
  //   }

  //   try {
  //     const result = await createAppointment({
  //       user_id: user.id,
  //       patient_name: values.patientName.trim(),
  //       age: values.age,
  //       gender: values.gender,
  //       relation: values.appointmentFor === "self" ? "self" : values.relation || "",
  //       phone: values.phone.replace(/\D/g, ''),
  //       appointment_date: values.date,
  //       appointment_time: values.time,
  //       notes: values.notes?.trim() || "",
  //       status: "pending"
  //     })

  //     if (result.success) {
  //       router.push("/dashboard/patient")
  //     } else {
  //       // Handle backend validation errors
  //       if (Array.isArray(result.error)) {
  //         // Map backend errors to form fields
  //         const backendErrorMap: Record<string, string> = {
  //           "Appointment date is required.": "date",
  //           "Invalid or unavailable appointment date selected.": "date",
  //           "Appointment time is required.": "time",
  //           "Invalid or unavailable appointment time selected.": "time",
  //           "Patient name is required.": "patientName",
  //           "Age must be a positive number.": "age",
  //           "Invalid gender selected.": "gender",
  //           "Invalid relation selected.": "relation",
  //           "Phone number is required.": "phone",
  //           "Phone number must be 11 digits long": "phone",
  //           "Mobile number must start with '03'": "phone"
  //         }

  //         // Handle appointment limit errors separately
  //         const limitError = result.error.find(err =>
  //           err.includes("pending appointment") ||
  //           err.includes("maximum limit")
  //         )

  //         if (limitError) {
  //           form.setError("root", { message: limitError })
  //         } else {
  //           // Map other errors to form fields
  //           result.error.forEach(err => {
  //             const field = backendErrorMap[err] || "root"
  //             setError(field as keyof FormValues | "root", {
  //               type: "manual",
  //               message: err
  //             })
  //           })
  //         }
  //       } else if (typeof result.error === "string") {
  //         // Handle single error string
  //         if (result.error.includes("pending appointment") ||
  //           result.error.includes("maximum limit")) {
  //           form.setError("root", { message: result.error })
  //         } else {
  //           // Try to map the error to a field
  //           const errorLower = result.error.toLowerCase()
  //           let field: keyof FormValues | "root" = "root"

  //           if (errorLower.includes("date")) field = "date"
  //           else if (errorLower.includes("time")) field = "time"
  //           else if (errorLower.includes("name")) field = "patientName"
  //           else if (errorLower.includes("age")) field = "age"
  //           else if (errorLower.includes("gender")) field = "gender"
  //           else if (errorLower.includes("relation")) field = "relation"
  //           else if (errorLower.includes("phone")) field = "phone"

  //           form.setError(field, { message: result.error })
  //         }
  //       }
  //     }
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       form.setError("root", {
  //         message: error.message
  //       })
  //     } else {
  //       form.setError("root", {
  //         message: "An unexpected error occurred"
  //       })
  //     }
  //   }
  // }
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      form.setError("root", { message: "User not authenticated" });
      return;
    }

    try {
      const result = await createAppointment({
        patient_name: values.patientName.trim(),
        age: values.age,
        gender: values.gender,
        relation:
          values.appointmentFor === "self" ? "self" : values.relation || "",
        phone: values.phone.replace(/\D/g, ""),
        appointment_date: values.date,
        appointment_time: values.time,
        notes: values.notes?.trim() || "",
      });

      if (result.success) {
        router.push("/dashboard/patient");
      } else {
        // Handle limit exceeded cases with specific messaging
        if (result.limitExceeded) {
          form.setError("root", {
            message: result.error,
            type: "limitExceeded", // This helps with styling if needed
          });
        }
        // Handle other error cases
        else if (typeof result.error === "string") {
          // Try to map the error to a field
          const errorLower = result.error.toLowerCase();
          let field: keyof FormValues | "root" = "root";

          if (errorLower.includes("date")) field = "date";
          else if (errorLower.includes("time")) field = "time";
          else if (errorLower.includes("name")) field = "patientName";
          else if (errorLower.includes("age")) field = "age";
          else if (errorLower.includes("gender")) field = "gender";
          else if (errorLower.includes("relation")) field = "relation";
          else if (errorLower.includes("phone")) field = "phone";

          form.setError(field, { message: result.error });
        }
      }
    } catch (error: unknown) {
      form.setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                Book Appointment
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Schedule your visit with Dr. Tariq Ahmed
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <div className="space-y-1">
                    <p className="font-medium">Appointment Limits:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Maximum 1 self-appointment per day</li>
                      <li>• Maximum 5 total appointments per day</li>
                      <li>• Only 1 appointment per relative name per day</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              {form.formState.errors.root && (
                <Alert
                  variant="destructive"
                  className="mb-6 border-red-600 dark:border-red-400"
                >
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-600 dark:text-red-400">
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Appointment For */}
                  <FormField
                    control={form.control}
                    name="appointmentFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium dark:text-white">
                          Who is this appointment for?
                        </FormLabel>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-6 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="self" id="self" />
                            <Label
                              htmlFor="self"
                              className="flex items-center cursor-pointer dark:text-gray-300"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Myself
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="relative" id="relative" />
                            <Label
                              htmlFor="relative"
                              className="flex items-center cursor-pointer dark:text-gray-300"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Family Member
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormItem>
                    )}
                  />

                  {/* Patient Information */}
                  <div
                    className={`${
                      showMonths ? "grid grid-cols-1" : "grid md:grid-cols-2"
                    } gap-4`}
                  >
                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-white">
                            Patient Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter patient name"
                              className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => {
                        // // Convert stored years to display value
                        // const displayValue = field.value === 0 ? '' :
                        //   field.value < 1 ? `${Math.round(field.value * 12)} months` :
                        //     `${field.value} ${field.value === 1 ? 'year' : 'years'}`;

                        return (
                          <FormItem>
                            <FormLabel className="dark:text-white">
                              Age
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <div className="relative flex">
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Enter age"
                                    className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white flex-1"
                                    value={
                                      field.value >= 1 || field.value === 0
                                        ? field.value === 0
                                          ? ""
                                          : Math.round(field.value)
                                        : Math.round(field.value * 12)
                                    }
                                    onChange={(e) => {
                                      const rawValue = e.target.value.replace(
                                        /[^0-9]/g,
                                        ""
                                      );
                                      const numericValue = rawValue
                                        ? parseInt(rawValue)
                                        : 0;

                                      // If showing months, convert to years
                                      const finalValue = showMonths
                                        ? numericValue / 12
                                        : numericValue;

                                      field.onChange(finalValue);
                                      setShowMonths(false); // Reset months selector if typing
                                    }}
                                  />
                                  {!showMonths && (
                                    <button
                                      type="button"
                                      onClick={() => setShowMonths(true)}
                                      className="ml-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      Under 1 year?
                                    </button>
                                  )}
                                </div>

                                {/* Months selector for infants */}
                                {showMonths && (
                                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-medium">
                                        Select months:
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowMonths(false);
                                          field.onChange(0); // Reset to 0 if cancelled
                                        }}
                                        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
                                        (month) => (
                                          <button
                                            key={month}
                                            type="button"
                                            onClick={() => {
                                              field.onChange(month / 12); // Store as years fraction
                                              setShowMonths(false);
                                            }}
                                            className={`px-2 py-1 text-sm rounded ${
                                              field.value * 12 === month
                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                            }`}
                                          >
                                            {month}{" "}
                                            {month === 1 ? "month" : "months"}
                                          </button>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </FormControl>

                            {/* Display formatted age */}
                            {field.value > 0 && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {field.value < 1 ? (
                                  <>
                                    <span className="font-medium">
                                      {Math.round(field.value * 12)} months
                                    </span>
                                    ({field.value.toFixed(2)} years)
                                  </>
                                ) : (
                                  <>
                                    <span className="font-medium">
                                      {field.value}{" "}
                                      {field.value === 1 ? "year" : "years"}
                                    </span>
                                  </>
                                )}
                              </p>
                            )}

                            <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-white">
                            Gender
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                              <SelectItem
                                value="male"
                                className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Male
                              </SelectItem>
                              <SelectItem
                                value="female"
                                className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Female
                              </SelectItem>
                              <SelectItem
                                value="other"
                                className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                Other
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                        </FormItem>
                      )}
                    />

                    {appointmentFor === "relative" && (
                      <FormField
                        control={form.control}
                        name="relation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-white">
                              Relation
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                  <SelectValue placeholder="Select relation" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                {RELATION_OPTIONS.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-white">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="03XXXXXXXXX"
                            className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            {...field}
                            onChange={(e) => {
                              // Only allow numbers and automatically format as 03XXXXXXXXX
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 11) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                      </FormItem>
                    )}
                  />

                  {/* Appointment Date & Time */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-white">
                            Preferred Date
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <SelectValue placeholder="Select date" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                              {/* {getAvailableDates.map((date) => {
                                const formattedDate = new Date(date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                })
                                return (
                                  <SelectItem
                                    key={date}
                                    value={date}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      {formattedDate}
                                    </div>
                                  </SelectItem>
                                )
                              })} */}
                              {getAvailableDates().map((date) => {
                                const dateObj = new Date(date + "T00:00:00Z"); // Add time to avoid timezon issues
                                const formattedDate =
                                  dateObj.toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                  });
                                return (
                                  <SelectItem
                                    key={date}
                                    value={date}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      {formattedDate}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-white">
                            Preferred Time
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                              {TIME_SLOTS.map((time) => (
                                <SelectItem
                                  key={time}
                                  value={time}
                                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {time}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Additional Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-white">
                          Additional Notes (Optional)
                          <span className="text-sm text-gray-500 ml-2">
                            {notes?.length || 0}/{MAX_NOTES_LENGTH}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any specific concerns or symptoms..."
                            className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 dark:text-red-400 font-medium" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 py-6 text-lg"
                    disabled={loading}
                  >
                    {loading ? "Booking Appointment..." : "Book Appointment"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
