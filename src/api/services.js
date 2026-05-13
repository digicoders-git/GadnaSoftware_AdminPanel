import api from './axiosInstance';

// Auth
export const loginAdmin = (data) => api.post('/admin/login', data);

// Admin
export const getAdmins = () => api.get('/admin');
export const createAdmin = (data) => api.post('/admin', data);
export const updateAdmin = (id, data) => api.put(`/admin/${id}`, data);
export const deleteAdmin = (id) => api.delete(`/admin/${id}`);

// Designations
export const getDesignations = (all = false) => api.get(`/designations${all ? '?all=true' : ''}`);
export const createDesignation = (data) => api.post('/designations', data);
export const updateDesignation = (id, data) => api.put(`/designations/${id}`, data);
export const deleteDesignation = (id) => api.delete(`/designations/${id}`);

// Users
export const getUsers = (all = false) => api.get(`/users${all ? '?all=true' : ''}`);
export const createUser = (data) => api.post('/users', data);
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getUnassignedUsers = () => api.get('/users/unassigned/list');
export const getUserStatusOverview = () => api.get('/users/status/overview');
export const getUsersByDutyType = (dutyType) => api.get(`/users/status/by-duty-type/${dutyType}`);

// Duties
export const getDuties = () => api.get('/duties');
export const createDuty = (data) => api.post('/duties', data);
export const getDutyById = (id) => api.get(`/duties/${id}`);
export const updateDuty = (id, data) => api.put(`/duties/${id}`, data);
export const deleteDuty = (id) => api.delete(`/duties/${id}`);
export const assignDuty = (id, data) => api.post(`/duties/${id}/assign`, data);
export const removeDutyAssignment = (id, data) => api.post(`/duties/${id}/remove`, data);
export const completeDuty = (id, data) => api.post(`/duties/${id}/complete`, data);

// Duty History
export const getAllHistory = () => api.get('/duty-history');
export const getUserHistory = (userId) => api.get(`/duty-history/user/${userId}`);
export const getDutyHistory = (dutyId) => api.get(`/duty-history/duty/${dutyId}`);

// Settings / My Profile
export const getMyProfile = () => api.get('/admin/me/profile');
export const updateMyProfile = (data) => api.put('/admin/me/profile', data);
export const changeMyPassword = (data) => api.put('/admin/me/change-password', data);

// Holidays
// Backend GET /api/holidays returns: { total, holidays: [...] }
export const getHolidays = (params = '') => api.get(`/holidays${params}`);
// Backend GET /api/holidays/today returns: { date, totalOnHoliday, holidays: [...] }
export const getTodayHolidays = () => api.get('/holidays/today');
export const getActiveHolidays = () => api.get('/holidays/active');
export const getUpcomingHolidays = () => api.get('/holidays/upcoming');
export const getReturnedHolidays = () => api.get('/holidays/returned');
export const getOverdueAlerts = () => api.get('/holidays/overdue-alerts');
export const getUserHolidays = (userId) => api.get(`/holidays/user/${userId}`);
export const createHoliday = (data) => api.post('/holidays', data);
export const updateHoliday = (id, data) => api.put(`/holidays/${id}`, data);
export const deleteHoliday = (id) => api.delete(`/holidays/${id}`);
