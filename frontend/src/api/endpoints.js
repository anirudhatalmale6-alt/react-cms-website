import API from './axios';

// Auth
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
  checkSetup: () => API.get('/auth/setup'),
  changePassword: (data) => API.post('/auth/change-password', data),
};

// Theme
export const themeAPI = {
  getAll: () => API.get('/theme'),
  get: (key) => API.get(`/theme/${key}`),
  upsert: (data) => API.post('/theme', data),
  bulkUpdate: (settings) => API.put('/theme/bulk', { settings }),
  remove: (key) => API.delete(`/theme/${key}`),
};

// Pages
export const pagesAPI = {
  getAll: () => API.get('/pages'),
  getPublished: () => API.get('/pages/published'),
  getBySlug: (slug) => API.get(`/pages/slug/${slug}`),
  getById: (id) => API.get(`/pages/${id}`),
  create: (data) => API.post('/pages', data),
  update: (id, data) => API.put(`/pages/${id}`, data),
  remove: (id) => API.delete(`/pages/${id}`),
};

// Services
export const servicesAPI = {
  getCategories: () => API.get('/services/categories'),
  createCategory: (data) => API.post('/services/categories', data),
  updateCategory: (id, data) => API.put(`/services/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/services/categories/${id}`),
  getAll: () => API.get('/services'),
  getPublished: () => API.get('/services/published'),
  getById: (id) => API.get(`/services/${id}`),
  create: (formData) => API.post('/services', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => API.put(`/services/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => API.delete(`/services/${id}`),
  deleteImage: (imageId) => API.delete(`/services/images/${imageId}`),
};

// Products
export const productsAPI = {
  getCategories: () => API.get('/products/categories'),
  createCategory: (data) => API.post('/products/categories', data),
  updateCategory: (id, data) => API.put(`/products/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/products/categories/${id}`),
  getAll: () => API.get('/products'),
  getPublished: () => API.get('/products/published'),
  getById: (id) => API.get(`/products/${id}`),
  create: (formData) => API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => API.delete(`/products/${id}`),
  deleteImage: (imageId) => API.delete(`/products/images/${imageId}`),
};

// Projects
export const projectsAPI = {
  getCategories: () => API.get('/projects/categories'),
  createCategory: (data) => API.post('/projects/categories', data),
  updateCategory: (id, data) => API.put(`/projects/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/projects/categories/${id}`),
  getAll: () => API.get('/projects'),
  getPublished: () => API.get('/projects/published'),
  getById: (id) => API.get(`/projects/${id}`),
  create: (formData) => API.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => API.put(`/projects/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => API.delete(`/projects/${id}`),
  deleteImage: (imageId) => API.delete(`/projects/images/${imageId}`),
};

// Quotations
export const quotationsAPI = {
  getAll: () => API.get('/quotations'),
  getById: (id) => API.get(`/quotations/${id}`),
  create: (data) => API.post('/quotations', data),
  update: (id, data) => API.put(`/quotations/${id}`, data),
  remove: (id) => API.delete(`/quotations/${id}`),
  getPdf: (id) => API.get(`/quotations/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id, data) => API.post(`/quotations/${id}/send`, data),
  sendOffer: (id, data) => API.post(`/quotations/${id}/offer`, data),
};

// Payments
export const paymentsAPI = {
  getSettings: () => API.get('/payments/settings'),
  updateSettings: (data) => API.post('/payments/settings', data),
  createStripeLink: (data) => API.post('/payments/stripe/create-link', data),
  createMultiSafePayLink: (data) => API.post('/payments/multisafepay/create-link', data),
  getTransactions: () => API.get('/payments/transactions'),
  getTransactionById: (id) => API.get(`/payments/transactions/${id}`),
};

// Partners
export const partnersAPI = {
  getAll: () => API.get('/partners'),
  getById: (id) => API.get(`/partners/${id}`),
  create: (formData) => API.post('/partners', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => API.put(`/partners/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => API.delete(`/partners/${id}`),
};

// Contact
export const contactAPI = {
  getDepartments: () => API.get('/contact/departments'),
  createDepartment: (data) => API.post('/contact/departments', data),
  updateDepartment: (id, data) => API.put(`/contact/departments/${id}`, data),
  deleteDepartment: (id) => API.delete(`/contact/departments/${id}`),
  getOptions: () => API.get('/contact/options'),
  createOption: (data) => API.post('/contact/options', data),
  updateOption: (id, data) => API.put(`/contact/options/${id}`, data),
  deleteOption: (id) => API.delete(`/contact/options/${id}`),
  getSubmissions: () => API.get('/contact/submissions'),
  getSubmissionById: (id) => API.get(`/contact/submissions/${id}`),
  deleteSubmission: (id) => API.delete(`/contact/submissions/${id}`),
  submit: (data) => API.post('/contact/submit', data),
};

// FAQ
export const faqAPI = {
  getCategories: () => API.get('/faq/categories'),
  createCategory: (data) => API.post('/faq/categories', data),
  updateCategory: (id, data) => API.put(`/faq/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/faq/categories/${id}`),
  getAll: () => API.get('/faq'),
  getById: (id) => API.get(`/faq/${id}`),
  create: (data) => API.post('/faq', data),
  update: (id, data) => API.put(`/faq/${id}`, data),
  remove: (id) => API.delete(`/faq/${id}`),
};

// SEO
export const seoAPI = {
  getSettings: () => API.get('/seo'),
  updateSettings: (formData) => API.put('/seo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Settings (SMTP)
export const settingsAPI = {
  getSmtp: () => API.get('/settings/smtp'),
  updateSmtp: (data) => API.put('/settings/smtp', data),
  testSmtp: (data) => API.post('/settings/smtp/test', data),
};

// Slider
export const sliderAPI = {
  getAll: () => API.get('/slider'),
  getPublished: () => API.get('/slider/published'),
  getById: (id) => API.get(`/slider/${id}`),
  create: (formData) => API.post('/slider', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => API.put(`/slider/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => API.delete(`/slider/${id}`),
  togglePublish: (id) => API.patch(`/slider/${id}/toggle`),
};

// Cookie Bar
export const cookiebarAPI = {
  getSettings: () => API.get('/cookiebar/settings'),
  updateSettings: (data) => API.put('/cookiebar/settings', data),
  getCategories: () => API.get('/cookiebar/categories'),
  createCategory: (data) => API.post('/cookiebar/categories', data),
  updateCategory: (id, data) => API.put(`/cookiebar/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/cookiebar/categories/${id}`),
};

// Media
export const mediaAPI = {
  list: () => API.get('/media/list'),
  upload: (formData) => API.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadMultiple: (formData) => API.post('/media/upload-multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (data) => API.delete('/media/delete', { data }),
};
