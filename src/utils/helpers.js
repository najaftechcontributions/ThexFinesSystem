/**
 * Helper utilities for the application
 */

import { employeesAPI, violationTypesAPI, finesAPI } from "../services/api";

// Force reload employees data
export const forceReloadEmployees = async (dispatch) => {
  try {
    const response = await employeesAPI.getAll();
    dispatch({ type: "SET_EMPLOYEES", payload: response.data });
  } catch (error) {
    console.error("Error reloading employees:", error);
  }
};

// Force reload violation types data
export const forceReloadViolations = async (dispatch) => {
  try {
    const response = await violationTypesAPI.getAll();
    dispatch({ type: "SET_VIOLATION_TYPES", payload: response.data });
  } catch (error) {
    console.error("Error reloading violations:", error);
  }
};

// Force reload fines data
export const forceReloadFines = async (dispatch) => {
  try {
    const response = await finesAPI.getAll();
    dispatch({ type: "SET_FINES", payload: response.data });
  } catch (error) {
    console.error("Error reloading fines:", error);
  }
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

export default {
  forceReloadEmployees,
  forceReloadViolations,
  forceReloadFines,
  formatCurrency,
  formatDate,
  validateEmail,
  validatePhone,
};
