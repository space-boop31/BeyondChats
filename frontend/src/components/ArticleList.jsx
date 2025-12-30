import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllArticles } from '../api/articles'
import ArticleCard from './ArticleCard'

function ArticleList() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'original', 'updated'

  useEffect(() => {
    fetchArticles()
  }, [filter])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const version = filter === 'all' ? null : filter
      const data = await getAllArticles(version)
      setArticles(data)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Articles
        </button>
        <button
          onClick={() => setFilter('original')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'original'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Original
        </button>
        <button
          onClick={() => setFilter('updated')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'updated'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Enhanced
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.id} to={`/article/${article.id}`}>
              <ArticleCard article={article} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default ArticleList

