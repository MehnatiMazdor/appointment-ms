import { createClient } from "@/lib/supabase-server-client";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status: newStatus } = await request.json(); // Renamed to newStatus to avoid conflict
    const appointmentId = (await params).id;

    if (!newStatus || !appointmentId) {
      return NextResponse.json(
        { error: "Status and appointment ID are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const userRole = profile.role;

    // Get current appointment status to apply rules
    const { data: currentAppointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("status")
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !currentAppointment) {
      return NextResponse.json({ error: "Appointment not found or could not retrieve current status" }, { status: 404 });
    }

    const currentStatus = currentAppointment.status;

    // --- Access Control Logic ---
    let canUpdate = false;

    if (userRole === "patient") {
      // Patient can only change status from "pending" to "cancelled"
      if (currentStatus === "pending" && newStatus === "cancelled") {
        canUpdate = true;
      }
    } else if (userRole === "admin") {
      // Admin can only change status from "pending" to "scheduled"
      if (currentStatus === "pending" && newStatus === "scheduled") {
        canUpdate = true;
      }
    } else if (userRole === "doctor") {
      // Doctor has full freedom to switch among "pending", "scheduled", and "cancelled"
      if (
        ["pending", "scheduled", "cancelled"].includes(newStatus) &&
        ["pending", "scheduled", "cancelled"].includes(currentStatus)
      ) {
        canUpdate = true;
      }
    }

    if (!canUpdate) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to perform this status change." },
        { status: 403 }
      );
    }
    // --- End Access Control Logic ---

    // Update appointment
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, appointment: data });
  } catch (error: unknown) {
    // console.error("Error in PATCH /appointments/:id:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}