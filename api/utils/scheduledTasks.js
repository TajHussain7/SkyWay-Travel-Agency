import cron from "node-cron";
import { archivePastBookings, archivePastFlights } from "./archiveBookings.js";

export const initializeScheduledTasks = () => {
  // Schedule archiving job to run daily at AM
  cron.schedule("0 2 * * *", async () => {
    console.log("Running scheduled archiving job at", new Date().toISOString());
    try {
      const bookingResult = await archivePastBookings();
      const flightResult = await archivePastFlights();
      console.log(`Successfully archived:`, {
        bookings: bookingResult,
        flights: flightResult,
      });
    } catch (error) {
      console.error("Error in scheduled archiving job:", error);
    }
  });
};

export const runArchivingJobNow = async () => {
  console.log("Running archiving job manually at", new Date().toISOString());
  try {
    const bookingResult = await archivePastBookings();
    const flightResult = await archivePastFlights();
    const result = {
      bookings: bookingResult,
      flights: flightResult,
    };
    console.log("Archive job completed:", result);
    return result;
  } catch (error) {
    console.error("Error in manual archiving job:", error);
    throw error;
  }
};
