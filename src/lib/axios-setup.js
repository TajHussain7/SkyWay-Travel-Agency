import axios from "axios";

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Check if response indicates maintenance mode
      if (error.response?.status === 503 && error.response?.data?.maintenance) {
        const currentPath = window.location.pathname;
        const isMaintenanceCheck = error.config?.url?.includes("/maintenance");

        if (currentPath !== "/maintenance" && !isMaintenanceCheck) {
          window.location.href = "/maintenance";
        }
      }

      return Promise.reject(error);
    },
  );
};

export default setupAxiosInterceptors;
