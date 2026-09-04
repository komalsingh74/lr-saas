import { toast, ToastOptions, Id } from "react-toastify";

// Base config (common for all)
const baseConfig: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  theme: "light",
};

// Types
type ToastType = "success" | "error" | "info" | "warning";

// ✅ Success
export const showSuccess = (message: string) => {
  toast.success(message, {
    ...baseConfig,
  });
};

// ❌ Error
export const showError = (message: string) => {
  toast.error(message, {
    ...baseConfig,
  });
};

// ⚠️ Warning
export const showWarning = (message: string) => {
  toast.warning(message, {
    ...baseConfig,
  });
};

// ℹ️ Info
export const showInfo = (message: string) => {
  toast.info(message, {
    ...baseConfig,
  });
};

// 🔄 Loading
export const showLoading = (message: string = "Please wait..."): Id => {
  return toast.loading(message, {
    ...baseConfig,
  });
};

// 🔁 Update toast (loading → success/error)
export const updateToast = (
  id: Id,
  type: ToastType,
  message: string
) => {
  toast.update(id, {
    render: message,
    type,
    isLoading: false,
    autoClose: 3000,
  });
};