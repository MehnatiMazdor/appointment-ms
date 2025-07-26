import { z } from "zod";
import { getAvailableDatesServer } from "../utils";

// Define reusable schemas
const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform((val) => val.replace(/\D/g, "")) // Remove non-digit characters
  .refine(
    (val) => val.length === 11,
    "Phone number must be 11 digits long (e.g., 03xxxxxxxxx)."
  )
  .refine((val) => val.startsWith("03"), "Phone number must start with '03'.");

const dateSchema = z.string().refine((val) => {
  const availableDates = getAvailableDatesServer();
  return availableDates.includes(val);
}, "Selected date is not available. Please choose a valid date from the list.");


const timeSchema = z.string().refine((val) => {
  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00",
    "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00",
    "16:30"
  ];
  return availableTimes.includes(val);
}, "Selected time is not available. Please choose a valid time from the list.");


const ageSchema = z.union([
    z.string().transform((val) => parseInt(val, 10)),
    z.number()
]).refine(val => !isNaN(val) && val >= 0, {
    message: "Age must be a positive number.",
});

const genderSchema = z.enum(["male", "female", "other"]);
const relationSchema = z.enum(["self", "father", "mother", "brother", "sister", "son", "daughter", "other"]);


// Main appointment schema
export const appointmentDataSchema = z.object({
    phone: phoneSchema,
    appointment_date: dateSchema,
    appointment_time: timeSchema,
    age: ageSchema,
    gender: genderSchema,
    relation: relationSchema,
    patient_name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
    notes: z.string().max(200, "Notes cannot exceed 200 characters").optional(),
    });