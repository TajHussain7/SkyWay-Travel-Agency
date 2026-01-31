import Settings from "../models/Settings.js";

// Get all settings
export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

// Update settings by category
export const updateSettings = async (req, res) => {
  try {
    const { category, data } = req.body;

    if (!category || !data) {
      return res.status(400).json({
        success: false,
        message: "Category and data are required",
      });
    }

    const validCategories = [
      "general",
      "booking",
      "archive",
      "notification",
      "security",
      "maintenance",
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const settings = await Settings.updateSettings(
      category,
      data,
      req.user._id,
    );

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

// Get maintenance status (public endpoint)
export const getMaintenanceStatus = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: {
        maintenanceMode: settings.maintenance.maintenanceMode,
        maintenanceMessage: settings.maintenance.maintenanceMessage,
        allowAdminAccess: settings.maintenance.allowAdminAccess,
      },
    });
  } catch (error) {
    console.error("Error fetching maintenance status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance status",
      error: error.message,
    });
  }
};
