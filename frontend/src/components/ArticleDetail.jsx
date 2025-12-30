import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getArticle, getAllArticles } from '../api/articles'

function ArticleDetail() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showVersion, setShowVersion] = useState('original')

  useEffect(() => {
    fetchArticle()
    fetchRelatedArticles()
  }, [id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const data = await getArticle(id)
      setArticle(data)
      setShowVersion(data.version || 'original')
    } catch (error) {
      console.error('Error fetching article:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedArticles = async () => {
    try {
      const allArticles = await getAllArticles()
      const related = allArticles
        .filter(a => a.id !== parseInt(id) && a.url === article?.url)
        .slice(0, 2)
      setRelatedArticles(related)
    } catch (error) {
      console.error('Error fetching related articles:', error)
    }
  }

  useEffect(() => {
    if (article) {
      fetchRelatedArticles()
    }
  }, [article])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Article not found.</p>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to articles
        </Link>
      </div>
    )
  }

  // Find the other version if it exists
  const otherVersion = relatedArticles.find(a => a.version !== article.version)

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        ← Back to articles
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        )}

        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded ${
                article.version === 'updated'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {article.version === 'updated' ? 'Enhanced Version' : 'Original Version'}
            </span>
            {otherVersion && (
              <Link
                to={`/article/${otherVersion.id}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                View {otherVersion.version === 'updated' ? 'Enhanced' : 'Original'} Version
              </Link>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
            {article.author && <span>By {article.author}</span>}
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            )}
            {article.source && <span>Source: {article.source}</span>}
          </div>

          {article.excerpt && (
            <div className="bg-gray-50 border-l-4 border-blue-600 p-4 mb-6">
              <p className="text-gray-700 italic">{article.excerpt}</p>
            </div>
          )}

          <div className="prose max-w-none">
            {article.content ? (
              <div className="article-content whitespace-pre-wrap text-gray-700 leading-relaxed">
                {article.content.split('\n').map((paragraph, idx) => {
                  if (paragraph.trim() === '') return <br key={idx} />;
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={idx} className="text-2xl font-bold mt-6 mb-4 text-gray-900">{paragraph.substring(3)}</h2>;
                  }
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={idx} className="text-xl font-bold mt-4 mb-3 text-gray-900">{paragraph.substring(4)}</h3>;
                  }
                  if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                    return <li key={idx} className="ml-6 mb-2">{paragraph.substring(2)}</li>;
                  }
                  if (paragraph.startsWith('---')) {
                    return <hr key={idx} className="my-6 border-gray-300" />;
                  }
                  return <p key={idx} className="mb-4">{paragraph}</p>;
                })}
              </div>
            ) : (
              <p className="text-gray-600">{article.excerpt}</p>
            )}
          </div>

          {article.references && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">References</h2>
              <ul className="list-disc list-inside space-y-2">
                {Array.isArray(article.references) ? (
                  article.references.map((ref, idx) => (
                    <li key={idx}>
                      <a
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {ref}
                      </a>
                    </li>
                  ))
                ) : (
                  <li>
                    <a
                      href={article.references}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {article.references}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArticleDetail

