import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

export const getWorkouts = () => api.get('/workouts').then(r => r.data);
export const getWorkout = (id) => api.get(`/workouts/${id}`).then(r => r.data);
export const createWorkout = (data) => api.post('/workouts', data).then(r => r.data);
export const deleteWorkout = (id) => api.delete(`/workouts/${id}`).then(r => r.data);

export const getExercises = (params) => api.get('/exercises', { params }).then(r => r.data);
export const getCategories = () => api.get('/exercises/categories').then(r => r.data);
export const createExercise = (data) => api.post('/exercises', data).then(r => r.data);
export const deleteExercise = (id) => api.delete(`/exercises/${id}`).then(r => r.data);

export const getExerciseProgress = (id) => api.get(`/progress/exercise/${id}`).then(r => r.data);
export const getSummary = () => api.get('/progress/summary').then(r => r.data);

export default api;
