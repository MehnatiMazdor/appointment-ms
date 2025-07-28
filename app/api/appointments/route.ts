import { createClient } from "@/lib/supabase-server-client";
import { type NextRequest, NextResponse } from "next/server";
import { appointmentDataSchema } from "@/lib/schema/appointmentData.schema";
import { getAvailableDatesServer } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "7", 10);

    const DATE_FILTER_OPTIONS = [
      "today",
      "tomorrow",
      "next-three-days",
      "next-week",
      "this-week",
      "this-month",
      "this-year",
    ];

    if (date && !DATE_FILTER_OPTIONS.includes(date)) {
      return NextResponse.json(
        { error: "Invalid date filter" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Step 1: Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Step 2: Get user role from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: profileError?.message || "Profile not found" },
        { status: 400 }
      );
    }

    const role = profile.role;

    // Step 3: Build base query
    let baseQuery = supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true });

    if (role === "patient") {
      baseQuery = baseQuery.eq("user_id", userId);
    }

    // Utility function to format Date -> "YYYY-MM-DD"
    const formatDate = (date: Date): string => date.toISOString().split("T")[0];

    // Step 4: Handle date filter
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // optional but ensures time is zeroed

      switch (date) {
        case "today": {
          baseQuery = baseQuery.eq("appointment_date", formatDate(today));
          break;
        }

        case "tomorrow": {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          baseQuery = baseQuery.eq("appointment_date", formatDate(tomorrow));
          break;
        }

        case "next-three-days": {
          const nextThreeDays = new Date(today);
          nextThreeDays.setDate(today.getDate() + 3);
          baseQuery = baseQuery
            .gte("appointment_date", formatDate(today))
            .lte("appointment_date", formatDate(nextThreeDays));
          break;
        }

        case "next-week": {
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          baseQuery = baseQuery
            .gte("appointment_date", formatDate(today))
            .lte("appointment_date", formatDate(nextWeek));
          break;
        }

        case "this-week": {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());

          const endOfWeek = new Date(today);
          endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

          baseQuery = baseQuery
            .gte("appointment_date", formatDate(startOfWeek))
            .lte("appointment_date", formatDate(endOfWeek));
          break;
        }

        case "this-month": {
          const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          const endOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          );
          baseQuery = baseQuery
            .gte("appointment_date", formatDate(startOfMonth))
            .lte("appointment_date", formatDate(endOfMonth));
          break;
        }

        case "this-year": {
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          const endOfYear = new Date(today.getFullYear(), 11, 31);
          baseQuery = baseQuery
            .gte("appointment_date", formatDate(startOfYear))
            .lte("appointment_date", formatDate(endOfYear));
          break;
        }
      }
    }

    // Step 4: Execute baseQuery
    const { data: allAppointments, error: allAppointmentsError } =
      await baseQuery;

    if (allAppointmentsError) {
      return NextResponse.json(
        { error: allAppointmentsError.message },
        { status: 400 }
      );
    }

    // Step 5: Stats
    const stats = {
      total: allAppointments.length || 0,
      pending:
        allAppointments.filter((apt) => apt.status === "pending").length || 0,
      scheduled:
        allAppointments.filter((apt) => apt.status === "scheduled").length || 0,
      cancelled:
        allAppointments.filter((apt) => apt.status === "cancelled").length || 0,
    };

    let filteredAppointments = allAppointments;
    // Step 5: Filter by status for displaying list (not for stats)
    if (status) {
      filteredAppointments = filteredAppointments.filter(
        (apt) => apt.status === status
      );
    }

    // Step 6: Pagination
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedAppointments = filteredAppointments.slice(from, to);

    console.log(`stats:`, stats);

    return NextResponse.json({
      appointments: paginatedAppointments,
      stats,
      pagination: {
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(filteredAppointments.length / limit)),
        totalItems: filteredAppointments.length || 0,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// --- Constants ---
const MAX_DAILY_TOTAL_APPOINTMENTS = 5;
const MAX_DAILY_SELF_PENDING = 1;



export async function POST(request: NextRequest) {
  try {
    const rawAppointmentData = await request.json();

    console.log("Received appointment data:", rawAppointmentData);

    // Validate with zod
    const parsedData = appointmentDataSchema.safeParse(rawAppointmentData);

    console.log("Parsed appointment data:", parsedData);
    console.log("getAvailableDatesServer:", getAvailableDatesServer());

    if (!parsedData.success) {
      const errorMessages = parsedData.error.issues.map(issue => issue.message);
      return NextResponse.json({ error: errorMessages }, { status: 400 }); 
    }

    const appointmentData = parsedData.data;
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if appointee role is 'patient'
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Failed to fetch user profile." }, { status: 500 });
    }

    if (profile.role !== "patient") {
      return NextResponse.json(
        { error: "Only patients can create appointments." },
        { status: 403 }
      );
    }

    // Fetch FULL pending appointments (not just selected fields)
     // --- New Policy: Daily Limits ---
    // Fetch all *pending* appointments for the *current user* on the *requested appointment_date*
    const { data: existingDailyAppointments, error: fetchDailyError } = await supabase
      .from('appointments')
      .select('id, relation, patient_name, appointment_time')
      .eq('user_id', user.id)
      .eq('appointment_date', appointmentData.appointment_date) // Filter by the requested date
      .eq('status', 'pending'); // Only consider pending appointments

    if (fetchDailyError) {
      console.error("Error fetching existing appointments:", fetchDailyError.message);
      return NextResponse.json({ error: "Failed to fetch existing appointments." }, { status: 500 });
    }

    let dailySelfAppointmentsCount = 0;
    let dailyRelativeAppointmentsCount = 0;
    const dailyUniqueRelativeNames = new Set<string>(); // Tracks unique relative names for the requested day
    

    existingDailyAppointments?.forEach((apt) => {
      if (apt.relation === "self") {
        dailySelfAppointmentsCount++;
      } else {
        dailyRelativeAppointmentsCount++;
        if (apt.patient_name) {
          dailyUniqueRelativeNames.add(apt.patient_name.toLowerCase().trim());
        }
      }  
    });

    const policyErrors: string[] = [];

    // Rule 1: Max 5 appointments per day (overall limit for the requested date)
    if (existingDailyAppointments.length >= MAX_DAILY_TOTAL_APPOINTMENTS) {
      // This is the 6th appointment attempt for this day.
      // Directly say "already created" or "daily limit reached."
      return NextResponse.json({
        error: [`You have reached the maximum of ${MAX_DAILY_TOTAL_APPOINTMENTS} pending appointments for ${appointmentData.appointment_date}.`],
        code: "DAILY_TOTAL_LIMIT_REACHED"
      }, { status: 403 });
    }

     // Rule 2: Max 1 self-appointment per day
    if (appointmentData.relation === 'self') {
      if (dailySelfAppointmentsCount >= MAX_DAILY_SELF_PENDING) {
        policyErrors.push(`You already have a pending appointment for yourself on ${appointmentData.appointment_date}.`);
      }
    } else { // This is a relative appointment
      // Rule 3: Max 1 appointment per unique relative patient name per day
      if (dailyUniqueRelativeNames.has(appointmentData.patient_name.toLowerCase())) {
        policyErrors.push(`You already have a pending appointment for '${appointmentData.patient_name}' on ${appointmentData.appointment_date}.`);
      }
      // Rule for total relative count on the day (if you still need a separate limit like 4 per day)
      // Note: This needs careful consideration with MAX_DAILY_TOTAL_APPOINTMENTS.
      // If MAX_DAILY_TOTAL_APPOINTMENTS is 5, and MAX_DAILY_SELF_PENDING is 1,
      // then max daily relatives would implicitly be 4. No need for a separate MAX_DAILY_RELATIVE_PENDING constant
      // if it's strictly derived from the total - self.
    }


    if (policyErrors.length > 0) {
      return NextResponse.json({ error: policyErrors, code: "DAILY_APPOINTMENT_POLICY_VIOLATION" }, { status: 403 });
    }

    // --- End Enhanced Limit Validation Logic ---

    // Create appointment if all validations pass
    const { data: newAppointment, error } = await supabase
      .from("appointments")
      .insert({
        patient_name: appointmentData.patient_name,
        age: appointmentData.age,
        gender: appointmentData.gender,
        relation: appointmentData.relation,
        phone: appointmentData.phone,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        notes: appointmentData.notes,
        status: "pending",
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating appointment:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, appointment: newAppointment });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}


// export async function POST(request: NextRequest) {
//   try {
//     const rawAppointmentData = await request.json();

//     // Validate with zod
//     const parsedData = appointmentDataSchema.safeParse(rawAppointmentData);

//     if (!parsedData.success) {
//       const errorMessages = parsedData.error.issues.map(issue => issue.message);
//       return NextResponse.json({ error: errorMessages }, { status: 400 }); 
//     }

//     const appointmentData = parsedData.data;
//     const supabase = await createClient();

//     // Get current user
//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser();
//     if (authError || !user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Check if appointee role is 'patient'
//     const { data: profile, error: profileError } = await supabase
//       .from("profiles")
//       .select("role")
//       .eq("id", user.id)
//       .single();

//     if (profileError || !profile) {
//       return NextResponse.json({ error: "Failed to fetch user profile." }, { status: 500 });
//     }

//     if (profile.role !== "patient") {
//       return NextResponse.json(
//         { error: "Only patients can create appointments." },
//         { status: 403 }
//       );
//     }

//     // Fetch FULL pending appointments (not just selected fields)
//     const { data: existingAppointments, error: fetchError } = await supabase
//       .from("appointments")
//       .select("*")
//       .eq("user_id", user.id)
//       .eq("status", "pending");

//     if (fetchError) {
//       console.error("Error fetching existing appointments:", fetchError.message);
//       return NextResponse.json({ error: "Failed to fetch existing appointments." }, { status: 500 });
//     }

//     // Separate self pending appointments and identify unique pending relative names
//     const selfPendingAppointments = existingAppointments?.filter((apt) => apt.relation === "self") || [];
//     const uniquePendingRelativeNames = new Set<string>();

//     existingAppointments?.forEach((apt) => {
//       if (apt.relation !== "self" && apt.patient_name) {
//         uniquePendingRelativeNames.add(apt.patient_name.toLowerCase().trim());
//       }
//     });

//     const newAppointmentRelation = appointmentData.relation;
//     const newAppointmentPatientNameNormalized = appointmentData.patient_name ? 
//       appointmentData.patient_name.toLowerCase().trim() : '';

//     // --- Enhanced Limit Validation Logic ---
//     if (newAppointmentRelation === "self") {
//       if (selfPendingAppointments.length >= 1) {
//         return NextResponse.json(
//           { 
//             error: "You already have a pending appointment for yourself.",
//             limitExceeded: true,
//             existingAppointments: selfPendingAppointments,
//             limitType: "self"
//           }, 
//           { status: 400 }
//         );
//       }
//     } else {
//       if (uniquePendingRelativeNames.has(newAppointmentPatientNameNormalized)) {
//         const existingForRelative = existingAppointments?.filter(apt => 
//           apt.patient_name.toLowerCase().trim() === newAppointmentPatientNameNormalized
//         ) || [];
        
//         return NextResponse.json(
//           { 
//             error: `You already have a pending appointment for "${appointmentData.patient_name}".`,
//             limitExceeded: true,
//             existingAppointments: existingForRelative,
//             limitType: "relative"
//           }, 
//           { status: 400 }
//         );
//       }

//       if (uniquePendingRelativeNames.size >= 3) {
//         const familyAppointments = existingAppointments?.filter(apt => 
//           apt.relation !== "self"
//         ) || [];
        
//         return NextResponse.json(
//           { 
//             error: "You have reached the maximum limit of 3 pending appointments for family members.",
//             limitExceeded: true,
//             existingAppointments: familyAppointments,
//             limitType: "family"
//           }, 
//           { status: 400 }
//         );
//       }
//     }

//     // --- End Enhanced Limit Validation Logic ---

//     // Create appointment if all validations pass
//     const { data, error } = await supabase
//       .from("appointments")
//       .insert({
//         patient_name: appointmentData.patient_name,
//         age: appointmentData.age,
//         gender: appointmentData.gender,
//         relation: appointmentData.relation,
//         phone: appointmentData.phone,
//         appointment_date: appointmentData.appointment_date,
//         appointment_time: appointmentData.appointment_time,
//         notes: appointmentData.notes,
//         status: "pending",
//         user_id: user.id,
//       })
//       .select()
//       .single();

//     if (error) {
//       console.error("Error creating appointment:", error.message);
//       return NextResponse.json({ error: error.message }, { status: 400 });
//     }

//     return NextResponse.json({ success: true, appointment: data });
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }
//     return NextResponse.json(
//       { error: "An unexpected error occurred" },
//       { status: 500 }
//     );
//   }
// }

// // export async function POST(request: NextRequest) {
// //   try {
// //     const rawAppointmentData = await request.json();

// //     // Validate with zod
// //     const parsedData = appointmentDataSchema.safeParse(rawAppointmentData);

// //     if (!parsedData.success) {
// //       // If validation fails, return the error messages
// //       const errorMessages = parsedData.error.issues.map(issue => issue.message);
// //       return NextResponse.json({ error: errorMessages }, { status: 400 }); 
// //     }

// //     // If validation passes, proceed with the rest of the logic
// //     const appointmentData = parsedData.data;

// //     const supabase = await createClient();

// //     // Get current user
// //     const {
// //       data: { user },
// //       error: authError,
// //     } = await supabase.auth.getUser();
// //     if (authError || !user) {
// //       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// //     }


// //     // Check if appointee role is 'patient'
// //     const { data: profile, error: profileError } = await supabase
// //       .from("profiles")
// //       .select("role")
// //       .eq("id", user.id)
// //       .single();

// //     if (profileError || !profile) {
// //       return NextResponse.json({ error: "Failed to fetch user profile." }, { status: 500 });
// //     }

// //     if (profile.role !== "patient") {
// //       return NextResponse.json(
// //         { error: "Only patients can create appointments." },
// //         { status: 403 }
// //       );
// //     }

// //     // Fetch ONLY PENDING appointments for the current user for limit validation
// //     const { data: existingAppointments, error: fetchError } = await supabase
// //       .from("appointments")
// //       .select("relation, patient_name, status")
// //       .eq("user_id", user.id)
// //       .eq("status", "pending"); // Only checking 'pending' status now

// //     if (fetchError) {
// //       console.error("Error fetching existing appointments for limit validation:", fetchError.message);
// //       return NextResponse.json({ error: "Failed to fetch existing appointments for limit validation." }, { status: 500 });
// //     }

// //     // Separate self pending appointments and identify unique pending relative names
// //     const selfPendingAppointments = existingAppointments?.filter((apt) => apt.relation === "self") || [];
// //     const uniquePendingRelativeNames = new Set<string>();

// //     existingAppointments?.forEach((apt) => {
// //       if (apt.relation !== "self" && apt.patient_name) {
// //         uniquePendingRelativeNames.add(apt.patient_name.toLowerCase().trim());
// //       }
// //     });

// //     const newAppointmentRelation = appointmentData.relation;
// //     const newAppointmentPatientNameNormalized = appointmentData.patient_name ? appointmentData.patient_name.toLowerCase().trim() : '';

// //     // --- Limit Validation Logic (only for 'pending' status) ---

// //     // Rule 1: Maximum 1 pending appointment for 'self'
// //     if (newAppointmentRelation === "self") {
// //       if (selfPendingAppointments.length >= 1) {
// //         return NextResponse.json(
// //           {
// //             error:
// //               "You already have a pending appointment for yourself. Please cancel your existing pending appointment before booking another for yourself.",
// //           },
// //           { status: 400 }
// //         );
// //       }
// //     } else { // New appointment is for a 'relative'
// //       // Rule 2: Only 1 pending appointment per unique relative name
// //       if (uniquePendingRelativeNames.has(newAppointmentPatientNameNormalized)) {
// //         return NextResponse.json(
// //           {
// //             error: `You already have a pending appointment for "${appointmentData.patient_name}". Please cancel their existing pending appointment before booking another for them.`,
// //           },
// //           { status: 400 }
// //         );
// //       }

// //       // Rule 3: Maximum 3 unique family members can have pending appointments
// //       // This checks if adding a *new* unique relative would exceed the limit of 3.
// //       if (uniquePendingRelativeNames.size >= 3) {
// //         return NextResponse.json(
// //           {
// //             error:
// //               "You have reached the maximum limit of 3 pending appointments for unique family members. You cannot book for another distinct relative.",
// //           },
// //           { status: 400 }
// //         );
// //       }
// //     }

// //     // --- End Limit Validation Logic ---

// //     // Create appointment if all validations pass
// //     const { data, error } = await supabase
// //       .from("appointments")
// //       .insert({
// //         patient_name: appointmentData.patient_name,
// //         age: appointmentData.age, // Ensure age is stored as integer
// //         gender: appointmentData.gender,
// //         relation: appointmentData.relation,
// //         phone: appointmentData.phone,
// //         appointment_date: appointmentData.appointment_date,
// //         appointment_time: appointmentData.appointment_time,
// //         notes: appointmentData.notes, // notes can be null/undefined
// //         status: "pending", // Always default to 'pending' on new creation
// //         user_id: user.id,
// //       })
// //       .select()
// //       .single();

// //     if (error) {
// //       console.error("Error creating appointment:", error.message);
// //       return NextResponse.json({ error: error.message }, { status: 400 });
// //     }

// //     return NextResponse.json({ success: true, appointment: data });
// //   } catch (error: unknown) {
// //     if (error instanceof Error) {
// //       return NextResponse.json({ error: error.message }, { status: 500 });
// //     }
// //     return NextResponse.json(
// //       { error: "An unexpected error occurred" },
// //       { status: 500 }
// //     );
// //   }
// // }

