import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/articles'

export const getAllArticles = async (version = null) => {
  const url = version ? `${API_BASE_URL}?version=${version}` : API_BASE_URL
  const response = await axios.get(url)
  return response.data
}

export const getArticle = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`)
  return response.data
}

export const updateArticle = async (id, data) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, data)
  return response.data
}

export const deleteArticle = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`)
  return response.data
}

